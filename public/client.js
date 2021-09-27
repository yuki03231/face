// クライアントからサーバーへの接続要求
const socket = io.connect();

//グローバル変数の設定
const g_elementDivJoinScreen = document.getElementById( "join-screen" );
const g_elementDivChatScreen = document.getElementById( "chat-screen" );
const g_elementInputUserName = document.getElementById( "input_nickname" );
const g_elementInputRoomName = document.getElementById( "input_roomname" );
const g_elementTextRoomName = document.getElementById( "text_roomname" );
const g_elementTextUserName = document.getElementById( "text_username" );

// 接続時の処理
// ・サーバーとクライアントの接続が確立すると、
// サーバー側で、'connection'イベント
// クライアント側で、'connect'イベントが発生する
socket.on(
    'connect',
    () =>
    {
        console.log( 'connect' );
    } );

// joinボタンを押したときの処理
$( '#join_form' ).submit(
    () =>
    {

        // ユーザー名
        let strInputUserName = g_elementInputUserName.value;
        g_elementTextUserName.value = strInputUserName;
    
        // ルーム名
        let strRoomName = g_elementInputRoomName.value;
        g_elementTextRoomName.value = strRoomName;
    
        // サーバーに"join"を送信
        socket.emit( "join", { roomname: strRoomName } );
        
        //サーバーに'nickname'を送信
        socket.emit( 'nickname', $( '#input_nickname' ).val() );
    
        // 画面の切り替え
        g_elementDivJoinScreen.style.display = "none";  // 参加画面の非表示
        g_elementDivChatScreen.style.display = "block";  // チャット画面の表示
        return false; //フォーム送信はしない
    } );

    //sendボタンが押された時の処理
    $( '#send' ).submit(
        () =>
        {
           //感情認識データを取り出す
           var icon = document.getElementById("icon").innerHTML; 
           var conce = document.getElementById("concentration").innerHTML; 
           var action = document.getElementById("action").innerHTML; 
           var status = document.getElementById("status").innerHTML; 
           var data = icon + "<br>" + conce + "<br>" + action + "<br>" + status;
           
           socket.emit('send',data); //'send'イベントとしてサーバーにデータを送信
    
           return false;   // フォーム送信はしない
        } );

// サーバーからの参加・退出メッセージ拡散に対する処理
socket.on(
    'spread message',
    //( strMessage ) =>
    ( objMessage ) =>
    {
        // メッセージ受け取り
        const strText = objMessage.strMessage;

        const li_element = $( '<li>' ).text( strText );
        $( '#message_list' ).prepend( li_element ); // リストの一番上に追加
    } );

//サーバーの拡散送信に対する処理
socket.on(
    'returndata',
    (otherdata)=>
    {
            $("#display").html(otherdata); //受け取ったデータをhtmlに入れる
    }
);
