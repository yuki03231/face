// もろもろの準備
var video = document.getElementById("video");           // video 要素を取得
var canvas = document.getElementById("canvas");         // canvas 要素の取得
var context = canvas.getContext("2d");                  // canvas の context の取得

var oldnose = new Array(2);                          //左目の空の座標
var count = 0; //回数をかぞえる変数
 
// getUserMedia によるカメラ映像の取得
var media = navigator.mediaDevices.getUserMedia({       // メディアデバイスを取得
  video: {facingMode: "user"},                          // カメラの映像を使う
  audio: false                                          // マイクの音声は使わない
});
media.then((stream) => {                                // メディアデバイスが取得できたら
  video.srcObject = stream;                             // video 要素にストリームを渡す
});
 
// clmtrackr の開始
var tracker = new clm.tracker();  // tracker オブジェクトを作成
tracker.init(pModel);             // tracker を所定のフェイスモデルで初期化
tracker.start(video);             // video 要素内でフェイストラッキング開始
 
// 感情分類の開始
var classifier = new emotionClassifier();               // emotionClassifier オブジェクトを作成
classifier.init(emotionModel);                          // classifier を所定の感情モデルで初期化
 
// 描画ループ
function drawLoop() {
  requestAnimationFrame(drawLoop);                      // drawLoop 関数を繰り返し実行
  var positions = tracker.getCurrentPosition();         // 顔部品の現在位置の取得
  var parameters = tracker.getCurrentParameters();      // 現在の顔のパラメータを取得
  var emotion = classifier.meanPredict(parameters);     // そのパラメータから感情を推定して emotion に結果を入れる
  //showEmotionData(emotion);                           // 感情データを表示      
  showStatus();                                         // 参加中か離席中か表示
  showIcon(emotion);                                    // 感情アイコンの表示
  document.getElementById("sendbutton").click()         //sendボタンの自動クリック
  context.clearRect(0, 0, canvas.width, canvas.height); // canvas をクリア
  tracker.draw(canvas);                               // canvas にトラッキング結果を描画
  showConcentration(positions);                         // 集中度の表示
}
drawLoop();                                             // drawLoop 関数をトリガー
 
// ★感情データの表示
function showEmotionData(emo) {
  var str ="";                                          // データの文字列を入れる変数
  for(var i = 0; i < emo.length; i++) {                 // 全ての感情（6種類）について
    str += emo[i].emotion + ": "                        // 感情名
         + emo[i].value.toFixed(1) + "<br>";            // 感情の程度（小数第一位まで）
  }
  var dat= document.getElementById("dat");             // データ表示用div要素の取得
  dat.innerHTML = str;                                  // データ文字列の表示
}

//感情アイコンの表示
//閾値設定
function showIcon(emo){
  if(emo[0].value > 0.5) {                          
    document.getElementById("icon").innerHTML = "<img src = 'icons/angerw.png'> ";     //怒り
  }
  else if(emo[3].value > 0.5) {                          
    document.getElementById("icon").innerHTML = "<img src = 'icons/sadw.png'> ";       //悲しみ
  }
  else if(emo[4].value > 0.8) {                          
    document.getElementById("icon").innerHTML = "<img src = 'icons/surprisedw.png'> "; //驚き
  }
  else if(emo[5].value > 0.5) {                          
    document.getElementById("icon").innerHTML = "<img src = 'icons/happyw.png'> ";     //幸せ
  }
  else{
    document.getElementById("icon").innerHTML = "<img src = 'icons/normalw.png'> ";    //無表情
  }
}

//集中度評価
function showConcentration(pos){
  //頷き検知
  var nose = pos[62];  //鼻の頂点の座標
	var dynose = nose[1] - oldnose[1]; //１フレームごとの変化量を求める
	oldnose[1] = nose[1]; //座標の更新

  if(dynose > 4){              //鼻の変化量が4を超えた場合
    var str = "うなずいています"
    var conce = document.getElementById("concentration");
    conce.style.color = "green";                     //緑文字
    conce.innerHTML = str;
  }
  else{
    var str = "";                     //動作がない場合は表示しない
    var conce = document.getElementById("concentration");
    conce.innerHTML = str;
  }
}

// ★参加中か離席中か表示
function showStatus(){
  if (tracker.track(video) == false){//trackができなければ
    var str = "離席中";
    var status = document.getElementById("status");
    status.style.color = "red";                     //赤文字
    status.innerHTML = str;
  }
  else{
    var str = "参加中";
    var status = document.getElementById("status");
    status.style.color = "green";                   //緑文字
    status.innerHTML = str;
  }
}