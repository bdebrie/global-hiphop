// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
var player2;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    videoId: 'frAy-g5Nn4Y',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });

  // player2 = new YT.Player('player2', {
  //   height: '200',
  //   width: '200',
  //   playerVars: {'controls': 0 },
  //   // videoId: 'frAy-g5Nn4Y',
  //   events: {
  //     'onReady': onPlayerReady,
  //     'onStateChange': onPlayerStateChange
  //   }
  // });
}



// The API will call this function when the video player is ready.
function onPlayerReady(event) {
  //event.target.playVideo();
  //loadNewVid("FSQ9dQ06dDA");
  console.log("let's go !!")
}

function loadNewVid(vidID){
     player.cueVideoById(vidID);
//   player2.cueVideoById(vidID, "large");
}

function playNewVid(videoid){
  $("#icons, #icons2").css("display", "block")
  nextSong = "oui"
  play_track = "yes"

  // var urlcomplete = "https://www.youtube.com/watch?v="+videoid
  // console.log(urlcomplete)

  player.loadVideoById(videoid)
  // player2.loadVideoById(videoid)
  // player2.mute()

  player.playVideo()
  //player2.playVideo()

}


//    The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {

  if (event.data == YT.PlayerState.PLAYING && !done) {
    var state = player.getPlayerState();
    done = true;
  }
  if(state == 1){
    var current_volume = player.getVolume();

    // Volume Slider
    $(function() {
      $( "#slider_vertical" ).slider({
        orientation: "vertical",
        range: "min",
        min: 0,
        max: 100,
        value: 50,
        slide: function( event, ui ) {
          $( "#volume" ).val( ui.value );
          player.setVolume(ui.value);
        }
      });
    });
    $('#slider_vertical').find(".ui-slider-range").css('height', current_volume+'%');
    // call the function every 250 milisecond.
    setInterval(displTime,250);  // PUT THIS STATEMENT JUST AFTER THE PLAYER HAS BEEN CREATED.
  }
}

nextSong = "oui"



function displTime() {



  var mind = player.getCurrentTime();   // returns elapsed time in seconds
  var m = Math.floor(mind / 60);
  var secd = mind % 60;
  var s = Math.ceil(secd)

  var dur = player.getDuration();       // returns duration time in seconds

  var dm = Math.floor(dur / 60);
  var dsecd = dur % 60;
  var ds = Math.ceil(dsecd)

  var playbackPercent = mind/dur;
  var sliderValue = playbackPercent * 100;
  var state = player.getPlayerState();

  var getVolume = player.getVolume();

  var randomLigne = Math.floor(Math.random() * tableau.length) + 1
  //console.log(playbackPercent,randomLigne)
  videodanslecteur = player.getVideoUrl().slice(32)
  //console.log(videodanslecteur)


  $("#time").html(m + ":" + n(s) + " | " + dm + ":" + n(ds) + " | Volume : " + getVolume);  // Using the JQUERY library to write to body

  $( "#slider_timeline" ).slider({
    range: "min",
    min:0,
    value: sliderValue,
    slide: function( event, ui ) {
          $( "#slider_timeline" ).val( ui.value );
          player.seekTo(player.getDuration() / 100 * ui.value);
        }
    });


  // adds a 0 to the seconds when the time is less than 9 seconds
  function n(n){
    return n > 9 ? "" + n: "0" + n;
  }

  // set player value
  if(state == 1){
    $("#player_control_button").removeClass('ui-icon-play').addClass('ui-icon-pause').click(function(){player.pauseVideo();});
  }else if(state == 2){
    $("#player_control_button").removeClass('ui-icon-pause').addClass('ui-icon-play').click(function(){player.playVideo();});
  }else if(state == 0){
    $("#player_control_button").removeClass('ui-icon-pause').addClass('ui-icon-arrowrefresh-1-e').click(function(){player.playVideo();});
  }else{
    var donothing;
  }

  // set play mute icons
  // if(getVolume != 0){
  //   $('#player_mute_button').removeClass('ui-icon-volume-off').addClass('ui-icon-volume-on').click(function(){player.mute();});
  // }else{
  //   $('#player_mute_button').removeClass('ui-icon-volume-on').addClass('ui-icon-volume-off').click(function(){player.unMute();});
  // }

  //Nouvelle vidz en rdm une fois la track finie
  //console.log(dur, mind, playbackPercent)




  if(playbackPercent == 1){
    if(nextSong == "oui"){
          // var randomLigne = Math.floor(Math.random() * tableau.length) + 1
          // var urlNextSong = tableau[randomLigne].url
          // playNewVid(urlNextSong.slice(32))
          // randomSong(tableau[randomLigne].artiste)
          // compteur(tableau[randomLigne].pays, tableau[randomLigne].iso3)
          $("#multiliste div").removeClass("nowplaying_puce")
          $("#multiliste p").removeClass("enJaune")

          d3.select(".lesCercles").selectAll("path").attr("fill", "rgba(255, 208, 7, 1)").attr("stroke-width", "1px")

          //LECTURE ALEATOIRE CUSTOMISEE
          //CrÃ©er les variables
          var ckbox = $("#aleatoire_continent");
          var ckbox_proche = $("#aleatoire_proche");
          var ckbox_pays = $("#aleatoire_pays");
          var aleatoire_pays;
          var aleatoire_continent;
          var randomLigne;
          var urlNextSong;

          //VÃ©rifier si la checkbox est cochÃ©e ou non
          if (ckbox.is(":checked")) {
            //Variable tÃ©moin
            aleatoire_continent = "oui"
            //Tableau temporaire vide pour stocker toutes les tracks du mÃªme continent
            var tableauContinent = [];

            //Bouclette dans le tableau pour rÃ©cup toutes les url du mÃªme continent
            for(var warm=0;warm<tableau.length;warm++){
              if(tableau[warm].continent == continent){
                tableauContinent.push(tableau[warm].url)
              }
            }

            //Balancer une url du mÃªme continent au hasard
            randomLigne = Math.floor(Math.random() * tableauContinent.length) + 1
            urlNextSong = tableauContinent[randomLigne]
            playNewVid(urlNextSong.slice(32))
            var trackEnCours = track

            //Utiliser l'url comme id pour rÃ©cup les infos du track dans le tableau principal
            for(var santiago=0;santiago<tableau.length;santiago++){
              if(tableau[santiago].url == urlNextSong){
                //Ce qui permet de lancer les fonctions qui remplissent les infos et updatent les infogs
                trajet(tableau[santiago].latitude, tableau[santiago].longitude, tableau[santiago].track, trackEnCours)
                randomSong(tableau[santiago].artiste)
                compteur(tableau[santiago].pays, tableau[santiago].iso3)
              }
            }
          }else if(ckbox_proche.is(":checked")){
            chanson_proche()
            fire_chanson_proche()
            //Et on lance toutes les shits
            var trackEnCours = track
            aleatoire_continent = "non"

            urlNextSong = laFuckingLigneQuIlFaut.urlOther
            playNewVid(urlNextSong.slice(32))
            trajet(laFuckingLigneQuIlFaut.latOther, laFuckingLigneQuIlFaut.longOther, laFuckingLigneQuIlFaut.trackOther, trackEnCours)
            randomSong(laFuckingLigneQuIlFaut.artisteOther)
            compteur(laFuckingLigneQuIlFaut.paysOther, laFuckingLigneQuIlFaut.iso3Other)
          }else if(ckbox_pays.is(":checked")){
            //Variable tÃ©moin
            aleatoire_pays = "oui"
            aleatoire_continent = "non"
            //Tableau temporaire vide pour stocker toutes les tracks du mÃªme continent
            var tableauPays = [];

            //Bouclette dans le tableau pour rÃ©cup toutes les url du mÃªme continent
            for(var s=0;s<tableau.length;s++){
              if(tableau[s].pays == nompays){
                // console.log(tableau[warm].track)
                tableauPays.push(tableau[s].url)
              }
            }

            //Balancer une url du mÃªme continent au hasard
            randomLigne = Math.floor(Math.random() * tableauPays.length) + 1
            urlNextSong = tableauPays[randomLigne]
            playNewVid(urlNextSong.slice(32))
            var trackEnCours = track


            //Utiliser l'url comme id pour rÃ©cup les infos du track dans le tableau principal
            for(var santiago=0;santiago<tableau.length;santiago++){
              if(tableau[santiago].url == urlNextSong){
                // console.log(tableau[warm].track)
                //Ce qui permet de lancer les fonctions qui remplissent les infos et updatent les infogs
                trajet(tableau[santiago].latitude, tableau[santiago].longitude, tableau[santiago].track, trackEnCours)
                randomSong(tableau[santiago].artiste)
                compteur(tableau[santiago].pays, tableau[santiago].iso3)
              }
            }
            //Si rien n'est cochÃ©...
            }else{
            var trackEnCours = track
            aleatoire_continent = "non"
            randomLigne = Math.floor(Math.random() * tableau.length) + 1
            urlNextSong = tableau[randomLigne].url
            playNewVid(urlNextSong.slice(32))
            trajet(tableau[randomLigne].latitude, tableau[randomLigne].longitude, tableau[randomLigne].track, trackEnCours)
            randomSong(tableau[randomLigne].artiste)
            compteur(tableau[randomLigne].pays, tableau[randomLigne].iso3)
          }
          for(var j=0;j<tableau.length;j++){
            if(tableau[j].track == track){
                ville = tableau[j].ville
                artiste = tableau[j].artiste
              }
          }
          afficherInfos(ville)
          $(".lesCercles #"+ville.split(' ').join('')).attr("fill", "white").attr("stroke-width", "2px")
    }else{

    }
  }else{

  }
}

