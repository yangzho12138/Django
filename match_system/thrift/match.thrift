namespace py match_service

service match {
    i32 add_player(1: i32 score, 2: string uuid, 3: string username, 4: string photo, 5: string channel_name), //channel_name用于和server端通信
}
