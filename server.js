'use strict';

// モジュール
const express = require( 'express' );
const http = require( 'http' );
const socketIO = require( 'socket.io' );

// オブジェクト
const app = express();
const server = http.Server( app );
const io = socketIO( server );

// 定数
const PORT = process.env.PORT || 1337;

// 接続時の処理
// ・サーバーとクライアントの接続が確立すると、
// サーバー側で、'connection'イベント
// クライアント側で、'connect'イベントが発生する

io.on(
    'connection',
    ( socket ) =>
    {
        console.log( 'connection' );

        let strNickname = '';	// コネクションごとで固有のニックネーム。イベントをまたいで使用される。

        // 切断時の処理
        // ・クライアントが切断したら、サーバー側では'disconnect'イベントが発生する
        socket.on(
            'disconnect',
            () =>
            {
                console.log( 'disconnect' );

                if( strNickname )
                {

                    // 退出メッセージの作成
                    const objMessage = {
                        strMessage: strNickname + 'さんが退出しました。',
                    }

                    // 同じ会議室の参加者全員に送信
                    io.to( socket.strRoomName).emit( 'spread message', objMessage );
                }
            } );

        
        // 入室時の処理
        socket.on(
            'join',
            ( objData ) =>
            {
                // ルーム名の受け取り
                let strRoomName = objData.roomname;

                // ルームへの入室
                socket.join( strRoomName );

                // ルーム名をsocketオブジェクトのメンバーに追加
                socket.strRoomName = strRoomName;
            } );

        //'nickname'イベントに対する処理
        socket.on(
            'nickname',
            ( strNickname_ ) =>
            { 
                // コネクションごとで固有のニックネームに設定
                strNickname = strNickname_;
    
                // 参加メッセージの作成
                const objMessage = {
                    strMessage: strNickname + 'さんが参加しました。',
                }
    
                // 同じ会議室の参加者全員に送信
                io.to( socket.strRoomName).emit( 'spread message', objMessage );
            } );

        //感情認識データの受け取り・データを拡散送信
        socket.on(
            'send',
            (data) =>
            {
                //データにnicknameを入れる
                var otherdata = strNickname + "さん: " + data;

                //自分以外の同じ会議室の参加者全員に送信
                socket.broadcast.to( socket.strRoomName ).emit('returndata',otherdata);
            } );
    } );

// 公開フォルダの指定
app.use( express.static( __dirname + '/public' ) );

// サーバーの起動
server.listen(
    PORT,
    () =>
    {
        console.log( 'Server on port %d', PORT );
    } );
