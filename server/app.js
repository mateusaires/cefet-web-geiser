console.log('Carregando módulos');
var express = require('express');
var fs = require('fs');

var app = express();

function myComparison(a,b){
	return b.playtime_forever - a.playtime_forever;
}

// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// dica: 3-4 linhas de código (você deve usar o módulo de filesystem (fs))
var db = {
	playerDb:null,
	gameDb:null
};
console.log('Carregando player database');
db.playerDb=JSON.parse(fs.readFileSync(__dirname+'/data/jogadores.json','utf8'));
console.log('Carregando game database');
db.gameDb=JSON.parse(fs.readFileSync(__dirname+'/data/jogosPorJogador.json','utf8'));

// configurar qual templating engine usar. Sugestão: hbs (handlebars)
console.log('setando template engines e views path');
app.set('view engine', 'hbs');
app.set('views',__dirname+'/views');


// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json
console.log('setando rota para pagina inicial');
app.get('/',function(request, response){
	console.log('Página inicial acessada');
	response.render('index',db.playerDb);
});

// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter umas 15 linhas de código
console.log('Setando rota para pagina de cada jogador');
app.get('/jogador/:steamid',function(request,response){
	var existe=false;
	var currentPlayer;
	var gameInfo;
	for(var index=0;index<db.playerDb.players.length;index++){
		if(db.playerDb.players[index].steamid==request.params.steamid){
			currentPlayer = db.playerDb.players[index];
			gameInfo = db.gameDb[request.params.steamid];
			//manipulação e cálculo dos dados
			var unplayed=0;
			for(var k=0;k<gameInfo.games.length;k++){
				if(gameInfo.games[k].playtime_forever!=0){
					gameInfo.games[k].hoursPlayed=Math.floor(gameInfo.games[k].playtime_forever/60);
				}else{
					unplayed++;
					gameInfo.games[k].hoursPlayed=0;
				}
			}
			gameInfo.notPlayed=unplayed;
			gameInfo.games.sort(myComparison);
			if(gameInfo.games.length>5){
				gameInfo.games = gameInfo.games.slice(0,5);
			}
			existe=true;
			break;
		}
	}
	if(existe){
		console.log('Player existente acessado');
		response.render('jogador',{
			player:currentPlayer,
			games:gameInfo,
			favorito:gameInfo.games[0]
		});
		
	}else{
		console.log('Player solicitado não existe');
		response.status(404).send('Player Not Found');
	}
});


// configurar para servir os arquivos estáticos da pasta "client"
console.log('setando path '+__dirname+'/../client para arquivos de cliente');
app.use(express.static(__dirname + '/../client'));

// abrir servidor
console.log('Abrindo Servidor na porta 3000 em localhost');
var server = app.listen(3000, function () {
  console.log('Servidor escutando em: http://localhost:3000');
});
