$(document).ready(function(){

//Fonction qui calcule les tailles en fonction de la taille de la fenêtre
function responsive() {
  //D'abord on véirifie si on est sur mobile et si oui on load un css particulier
  var isThisTheRealWorld = checkMobile();

  if(isThisTheRealWorld == true){
    window.location.href = "mobile/index.html";
  }

  //Calculer la taille de la fenêtre et du document entier, stocker dans des variables
  hauteur = $(window).height();
  largeur = $(window).width();
  hauteurGene = $(document).height()

  //Les affecteur comme taille au conteneur (qui a une width bloquée sur 850px en css)
  $(".conteneur, #globe").css("width", largeur)
  $(".conteneur, #globe").css("height", hauteur/10*8.5)
  $(".conteneur").css("padding-top", hauteur/10*1.5)


  $("#image_volume").hide()

}//FIN DE LA FONCTION RESPONSIVE

responsive()//On appelle la fonction responsive une première fois au chargement
shouldYouTurn="yes"
villesAffichees="non"
didYouJustDezoom="non"
resetScale=200
tableCompteur = []
tableauISO = []
var tableauHistorique = []
distanceTotale = 0
firstTimeDistance = "oui"
onglet_distances_ouvert = "non"
historiqueDistance = []




//  ######    #######   #######   ######   ##       ######## ########   #######   ######
// ##    ##  ##     ## ##     ## ##    ##  ##       ##       ##     ## ##     ## ##    ##
// ##        ##     ## ##     ## ##        ##       ##       ##     ## ##     ## ##
// ##   #### ##     ## ##     ## ##   #### ##       ######   ##     ## ##     ## ##
// ##    ##  ##     ## ##     ## ##    ##  ##       ##       ##     ## ##     ## ##
// ##    ##  ##     ## ##     ## ##    ##  ##       ##       ##     ## ##     ## ##    ##
//  ######    #######   #######   ######   ######## ######## ########   #######   ######




$(window).load(function () {
  responsive()

  // Création de l'instance de Gselper
  var doc = new Gselper({

      // Identifiant du document
      key: "18l3q89q0UZAv42nqpHkmbainbFumD13wUcLOP3BEky4",

      // Le worksheet du document (od6 = la première feuille par défaut)
      worksheet: "od6",

      // La fonction à appeler lorsque le document est chargé
      onComplete: function(data) {
        tableau = doc.get();
        letsgeaux();
      },

      // La fonction à appeler lorsque qu'une erreur survient dans le chargement
      onFail: function(data) {
          console.log( "Something happened. Something happened." );
      }
  });










  //Fonction qui se lance une fois que la base de données Gdocs est chargée
  letsgeaux = function(){

    var stats = {};
    stats.tracksCount = tableau.length;
    stats.countriesList = [];
    stats.citiesList = [];

    $.each(tableau, function (i, track) {
      if($.inArray(track.pays, stats.countriesList) === -1) {
        stats.countriesList.push(track.pays);
      }
      if($.inArray(track.ville, stats.citiesList) === -1) {
        stats.citiesList.push(track.ville);
      }
    })

    //COMPTER LE NOMBRE DE MORCEAUX PAR VILLE UNIQUE
    //On utilise pour ça deux tableaux qu'on va réutiliser tout le temps
    //C'est des sortes de tableaux croisés (mais ils ont pas toutes les variables)
    temp = [];
    produce = [];

    for(var i=0;i<tableau.length;i++){
      if(temp.indexOf(tableau[i].ville) == -1){
        temp.push(tableau[i].ville);
        var _data = {};
        _data.name = tableau[i].ville;
        _data.iso3 = tableau[i].iso3;
        _data.pays = tableau[i].pays;
        _data.count = 1;
        _data.nbville = tableau[i].nbville;
        _data.latitude = tableau[i].latitude;
        _data.longitude = tableau[i].longitude;

        produce.push(_data);
      }else{
        for(var j=0;j<produce.length;j++){
          if(produce[j].name === tableau[i].ville){
            var _x = parseInt(produce[j].count) + 1;
            produce[j].count = _x;
          }
        }
      }
    }

    $(".phrase_titre").html("<span class=\"enJaune\">"+stats.countriesList.length+"</span> pays / <span class=\"enJaune\">"+stats.citiesList.length+"</span> villes / <span class=\"enJaune\">"+stats.tracksCount +"</span> morceaux")

    //Caler les dimensions du conteneur
    width = $(".conteneur").width();
    height = $(".conteneur").height();
    ratio = 6;
    scale = largeur > 1200 ? height / 2.8 : width / 5;

    //Initialiser la projection
    projection = d3.geo.orthographic()
      .scale(scale)
      .translate([width / 2, height / 2])
      .clipAngle(90)
      .precision(.1);

    //Le zoom
    var zoom = d3.behavior.zoom()
            .on("zoom",zoomed);


    var zoomEnhanced = d3.geo.zoom().projection(projection)
            .scaleExtent([250,2500])
            .on("zoom",zoomedEnhanced);

    //Le drag
    var drag = d3.behavior.drag()
              .origin(function() { var r = projection.rotate(); return {x: r[0], y: -r[1]}; })
              .on("drag", dragged)
              .on("dragstart", dragstarted)
              .on("dragend", dragended);

    //Centrer le globe comme on veut
    origin = [2, -50];
    projection.rotate(origin);

    //Créer le géopath et le graticule
    path = d3.geo.path()
        .projection(projection);

    var graticule = d3.geo.graticule();

    //Et appender un svg sur la div
    svg = d3.select("#globe").append("svg")
      .attr("id", "le_svg")
        .attr("width", width)
        .attr("height", height);


    pathG = svg.append("g").attr("class", "pathG");

    //Pour mettre une couleur de fond au globe
    pathG.append("path")
      .datum({type: "Sphere"})
      .attr("class", "water")
      .attr("d", path)
      .attr("stroke-width", 30)
      .attr("stroke", "white")
      .attr("fill", "white")


    //Rectangle de hover pour les actions utilisateur
    pathG.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .call(zoomEnhanced)
            .on("mousedown", stopAnimation)
            .on("dblclick.zoom", null)
            .on("contextmenu", function (d, i) {
                    //Empêcher le clic droit pour éviter bug de drag
                d3.event.preventDefault();
            })

    //Graticule
    pathG.insert("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)

    //Créer un groupe pour stocker les pays
    g = pathG.append("g").attr("id", "pays")
    g_trajet = pathG.append("g").attr("id", "trajet")
    g_frontieres = pathG.append("g").attr("id", "frontieres")

    var origin = projection.rotate();
      // origin = [origin[0] + .18, origin[1] + .06];




    //Loader le geojson
    d3.json("source/mondeok6.json", function(error, world) {
      g_frontieres.insert("path", ".frontieres")
          .datum(topojson.mesh(world, world.objects.mondeok, function(a, b) { return a !== b; }))
          .attr("class", "boundary")
          .attr("d", path);


      //DESSINER LES PAYS
      g.selectAll("pays")
      .data(topojson.feature(world, world.objects.mondeok).features)
      .enter().append("path")
      .attr("class", "pays")
      .attr("id", function(d){
        return d.properties.iso_a3
      })
      .attr("d", path)
      .attr("fill", function(d){
        var isoPays = d.properties.iso_a3
        for(var j=0;j<tableau.length;j++){
          if(tableau[j].iso3 === isoPays){
            return "rgba(178,178,178,1)"
          }
        }
        return "rgba(217,217,217,1)"
      })
      .attr("stroke-width", "1px")
      .attr("stroke", "rgba(0,0,0,0.1)")
      .on("click", function(d){
                  var iso3 = d.properties.iso_a3
                  clickPays(iso3)
                  centrerPays(d, iso3)
                })
                .call(zoomEnhanced)
                .on("contextmenu", function (d, i) {
                  //Empêcher le clic droit pour éviter bug de drag
              d3.event.preventDefault();
          })
          .on("dblclick.zoom", null)
                .on("mousedown", stopAnimation)

      //Créer un groupe pour stocker les cercles
      pathG.append("g").attr("class", "lesCercles")

      //Trier le tableau pour avoir les gros cercles en dessous des petits
      produce2 = produce.sort(compare)

      //Créer les cercles : en fait c'est pas des circles mais des points (plus facile pour globe)
      d3.select(".lesCercles").selectAll("path")
        .data(produce2)
        .enter()
                .append("path")
                .classed("city", true)
                .datum(function(d) {
                        return {
                            type: "Point",
                            count: d.nbville,
                            ville: d.name,
                            iso3: d.iso3,
                            pays: d.pays,
                            longitude: d.longitude,
                            latitude: d.latitude,
                            coordinates: [d.longitude, d.latitude]
                        }; })
                .on("click", function(d){//Lancer une fonction quand on clique sur le cercle
                  long = d.longitude
                  lat = d.latitude
                  ville = d.ville
                  count = d.count
                  pays = d.pays
                  iso = d.iso3
                  d3.select(".lesCercles").selectAll("path").attr("fill", "rgba(255, 208, 7, 1)").attr("stroke-width", "1px")
                  $(this).attr("fill", "white")
                  $(this).attr("stroke-width", "2px")
                  clickCercles(long, lat, ville, count, pays, iso)
                })
                .attr("id", function(d){
                  return d.ville.split(' ').join('')
                })
                .on("contextmenu", function (d, i) {
                  //Empêcher le clic droit pour éviter bug de drag
              d3.event.preventDefault();
          })
                .call(zoomEnhanced)//Pour qu'on puisse zoomer même quand souris sur cercles et pas sur pays
                .on("dblclick.zoom", null)
                .attr("d", path)
                .attr("title", function(d){//Title pour le tooltip
                  var ville = d.ville
                  var pays = d.pays
                  var count = d.count
                  if(count==1){
                    return "<b>"+ville+" ("+pays+")</b><hr>"+count+" artiste"
                  }else{
                    return "<b>"+ville+" ("+pays+")</b><hr>"+count+" artistes"
                  }

                })
                .attr("fill", "rgba(255, 208, 7, 1)")
                .attr("stroke", "rgba(22, 22, 22, 1)")

            //Lancer l'animation du globe qui tourne
        //startAnimation();
    });

    // Changer le rayon de tous les cercles en fonction du nombre de chansons
          path.pointRadius(function(d,i) {
              if (d.type =="Point") {
                return aire(d.count)*ratio
              }
          });


          $("#wrapper_plani").css("height", function(){
            return $("#wrapper_plani").width()
          })

          $("#wrapper_graphique").css("margin-top", function(){
            return ("-"+$("#wrapper_plani").height()/2.6+"px")
          })

          //Fonctions de zoom et de drag (d3)
    function zoomed(){

      pathG.attr("transform", "translate(" + d3.event.translate + ")scale(1).event)");
      pathG.selectAll("path.boundary").style("stroke-width", 0.5 / d3.event.scale);
      didYouJustDezoom = "non"

    }

    function zoomedEnhanced(){
      pathG.selectAll("path").attr("d",path);

    }

    function dragstarted(d){
      //stopPropagation prevents dragging to "bubble up" which triggers same event for all elements below this object

      d3.event.sourceEvent.stopPropagation();
      d3.select(this).classed("dragging", true);
    }

    function dragged(){
      projection.rotate([d3.event.x, -d3.event.y]);
      pathG.selectAll("path").attr("d", path);
    }

    function dragended(d){
      d3.select(this).classed("dragging", false);
    }



          //Fonction qui stoppe l'anim
          function stopAnimation() {
      done_spin = true;
      // d3.select('#animate').node().checked = false;
    }

    //Fonction qui lance l'anim
    function startAnimation() {
      done_spin = false;
      d3.timer(function() {
        var origin = projection.rotate();
        // origin = [origin[0] + .18, origin[1] + .06];
        origin = [origin[0] + 1, origin[1]];
        projection.rotate(origin);
        pathG.selectAll("path").attr("d", path)
        return done_spin;
      });
    }

    startAnimation()


    function centrerPays(d, iso3){
      //Ca c'est pour faire la diff entre un drag et un clic
      if (d3.event.defaultPrevented) return;
      for(var j=0;j<tableau.length;j++){
        if(tableau[j].iso3 === d.properties.iso_a3){
          d3.transition()
            .duration(1200)
            .tween("rotate", function() {
              var p = d3.geo.centroid(d),
                      r = d3.interpolate(projection.rotate(), [-p[0], -p[1], 0]);
              return function(t) {
              projection.rotate(r(t));
              pathG.selectAll("path").attr("d", path)
            };
          })
        }
      }

    }

    //FONCTION QUI SE LANCE AU CLIC SUR UN PAYS
    function clickPays(iso3){
      //Ca c'est pour faire la diff entre un drag et un clic
      if (d3.event.defaultPrevented) return;

      //Masquer les consignes
      $("#consignes").css("display", "none")
      d3.select(".lesCercles").selectAll("path").attr("fill", "rgba(255, 208, 7, 1)").attr("stroke-width", "1px")

      //Mettre tous les pays dans le bon gris
      g.selectAll("path")
        .attr("fill", function(d){
          for(var j=0;j<tableau.length;j++){
            if(tableau[j].iso3 === d.properties.iso_a3){
              return "rgba(178,178,178,1)"
            }
          }
          return "rgba(217,217,217,1)"
        })

      //Trouver le bon pays
      for(var i=0;i<tableau.length;i++){
        if(tableau[i].iso3 === iso3){
          nompays = tableau[i].pays
          continent = tableau[i].continent
          track = tableau[i].track
          $("#nomville, #nompays, #reste, #artiste, #track, #album, #continent, #multiliste").html("")
          $("#nompays").html(nompays)
          break;
        }else{
          $("#nompays").html("")
        }
      }

      //Mettre le bon cliqué en jaune (si une chanson au moins y est associée)
      $("#"+iso3).attr("fill", function(){
        for(var j=0;j<tableau.length;j++){
          if(tableau[j].iso3 == iso3){
            return "rgba(255, 208, 7, 1)"
          }
        }
      })


      //Trouver les bonnes villes
      temp2 = [];
      villes_uniques = [];

      for(var i=0;i<tableau.length;i++){
        if(temp2.indexOf(tableau[i].ville) == -1){
          temp2.push(tableau[i].ville);
          var _data = {};
          _data.name = tableau[i].ville;
          _data.iso3 = tableau[i].iso3;
          _data.pays = tableau[i].pays;
          _data.count = 1;
          _data.nbville = tableau[i].nbville;
          _data.latitude = tableau[i].latitude;
          _data.longitude = tableau[i].longitude;

          villes_uniques.push(_data);
        }else{
          for(var j=0;j<villes_uniques.length;j++){
            if(villes_uniques[j].ville === tableau[i].ville){
              var _x = parseInt(villes_uniques[j].count) + 1;
              villes_uniques[j].count = _x;
            }
          }
        }
      }

      ville_double_artistes = ""
      //Virer les puces
      $( ".puce_solotrack" ).remove();

      villes_uniques.sort(function(a, b) {
        return compareStrings(a.name, b.name);
      })

      for(var y=0;y<villes_uniques.length;y++){
        liste_nomville_sans_espaces = villes_uniques[y].name.split(' ').join('')
        if(villes_uniques[y].iso3 == iso3){
          ville_double_artistes = ville_double_artistes+"<div class = \"nomville_dansliste\"id=\""+liste_nomville_sans_espaces+"\"><h3>"+villes_uniques[y].name+"</h3></div>"
        }
      }

      $("#multiliste").html(ville_double_artistes)

      villes_uniques.sort(function(a, b) {
        return compareStrings(a.name, b.name);
      })

      tableau_tri = tableau.sort(function(a, b) {
        return compareStrings(a.artiste, b.artiste);
      })

      for(var i=0;i<tableau_tri.length;i++){
        liste_artiste = tableau_tri[i].artiste
        liste_track = tableau_tri[i].track
        liste_nomville = tableau_tri[i].ville
        nomville_sans_espaces = liste_nomville.split(' ').join('')

        $("#"+nomville_sans_espaces).append("<p onClick=\"multiArtistes_fromCity(this)\" class=\"ville_double_artistes\" id=\""+tableau_tri[i].artiste+"\"><span class=\"artiste_bold\">"+liste_artiste+"</span><br>"+liste_track+"</p><br>")
      }

      $( "<div class =\"puce_solotrack\"></div>" ).insertBefore( ".ville_double_artistes" )

      $("#conteneur_infos").animate({
         scrollTop: 0
      }, 200);

    }

    // FONCTION POUR AFFICHER LES CERCLES PROPS
    function clickCercles(long, lat, ville, count, pays, iso){
      //Ca c'est pour faire la diff entre un drag et un clic
      if (d3.event.defaultPrevented) return;

      //Masquer les consignes
      $("#consignes").css("display", "none")
      //Virer la typo (sans faire appel à la fonction car on veut pas changer la variable villesAffichees)
      d3.select(".typo_cercles").remove()
      //D'abord arrêter le mouvement du globe au cas où
      stopAnimation()

      //Faire tourner le globe pour centrer sur la ville cliquée
      d3.transition()
        .duration(1200)
        .tween("rotate", function() {
          //console.log(projection.rotate())
          var r = d3.interpolate(projection.rotate(), [-long, -lat, 0]);
          return function(t) {
          projection.rotate(r(t));
          pathG.selectAll("path").attr("d", path)
        };
      })

      //Colorer le pays de la ville en noir
      g.selectAll("path")
        .attr("fill", function(d){
          // console.log(this.id, ville)
          var isoPays = d.properties.iso_a3

          for(var j=0;j<tableau.length;j++){
            if(tableau[j].ville === ville){
              if(tableau[j].iso3 == this.id){
                return "rgba(255, 208, 7, 1)"
              }
            }
          }
          for(var j=0;j<tableau.length;j++){
            if(tableau[j].iso3 === isoPays){
              return "rgba(178,178,178,1)"
            }
          }
          return "rgba(217,217,217,1)"
        })





      //S'il n'y a qu'une seule chanson pour cette ville
      if(count==1){
        //Alors afficher les infos et lire la chanson
        afficherInfos(ville)
        /*playDaSong(ville)
        compteur(pays, iso)*/
      }else{
        //Sinon juste afficher les infos pour que l'utilisateur choisisse entre les chansons
        afficherInfos(ville)
      }

      //Si les villes sont affichees (globalement) alors les remettre sur les nouvelles coordonnées
      //Lancer la fonctiona vec un retard égal à la durée du tween du globe
      if(villesAffichees=="oui"){
        pathG.append("g").attr("class", "typo_cercles")
        setTimeout(writeCityNames, 1200)
      }

    }


    //Fonction qui lance une chanson
    function playDaSong(el){
    for(var i=0;i<tableau.length;i++){
      if(tableau[i].ville === el){
        var url_video = tableau[i].url
        // var compteur = tableau[i].nbville
      }
    }

    playNewVid(url_video.slice(32))


    }

    //Fonction qui affiche les infos quand on clique sur un cercle
    afficherInfos = function(el){
      //Virer les puces
      $( ".puce_solotrack" ).remove();
      //Boucler dans le tableau pour récup toutes les infos sur cete ville
      for(var i=0;i<tableau.length;i++){
        if(tableau[i].ville === el){
          nompays = tableau[i].pays
          nomville = tableau[i].ville
          track = tableau[i].track
          artiste = tableau[i].artiste
          album = tableau[i].album
          annee = tableau[i].annee
          count = tableau[i].nbville
          url = tableau[i].url
          continent = tableau[i].continent
        }
      }

      // Vider les conteneurs de texte
      $("#nomville, #nompays, #reste, #artiste, #track, #album, #continent, #multiliste").html("")

      //Afficher la bonne ville et le bon pays
      $("#nomville").html("<span onClick=\"backToTrack()\">"+nomville+"</span>")
      $("#nompays").html(nompays)

      //S'il n'y a qu'une seule chanson dans la ville
      if(count==1){
        $("#multiliste").html("<div class=\"wrapper_soloville\"><p id=\""+artiste+"\" class=\"ville_double_artistes\" onClick=\"multiArtistes_fromCity(this)\"><span class=\"artiste_bold\">"+artiste+"</span><br>"+track+"</p></div>")
        $("#lien_youtube").html("<a href=\""+url+"\" target=\"_blank\"><img src=\"logo_youtube-01.png\" width=\"25px\" title=\"Voir le clip sur Youtube\"></a>")
        $( "<div class =\"puce_solotrack\"></div>" ).insertBefore( ".ville_double_artistes" )
      }else{
        //Sinon proposer de choisir entre les différentes chansons de la ville
        //Créer une variable vide pour stocker les chansons de la ville
        ville_double_artistes = ""
        //Boucler dans le tableau pour stocker dans variables tous les noms cliquables des artistes/chansons
        for(var w=0;w<tableau.length;w++){
          if(tableau[w].ville === el){
            ville_double_artistes = ville_double_artistes+"<p id=\""+tableau[w].artiste+"\" class=\"ville_double_artistes\" onClick=\"multiArtistes_fromCity(this)\"><span class=\"artiste_bold\">"+tableau[w].artiste+"</span><br>"+tableau[w].track+"</p><br>"
          }
        }
        //Afficher les différentes chansons à l'endroit où on écrit le titre normalement
        //Quand on clique sur une chanson, ça lance la fonction multiArtistes_fromCity()
        $("#multiliste").html("<div class=\"wrapper_soloville\">"+ville_double_artistes+"</div>")
        $( "<div class =\"puce_solotrack\"></div>" ).insertBefore( ".ville_double_artistes" )
      }

    }

    //POUR FAIRE COMMUNIQUER LA PUCE AVEC LE NOM ET INVERSEMENT

    $(document).on("click",".puce_solotrack",function () {
        var hop = $(this).next()
        multiArtistes_fromCity(hop)
    });

    $(document).on("mouseover",".puce_solotrack",function () {
        var hop = $(this).next()
        hop.css("color", "rgba(255, 208, 7, 1)")
        $(this).css("background", "rgba(255, 208, 7, 1)")
    });

    $(document).on("mouseout",".puce_solotrack",function () {
        var hop = $(this).next()
        hop.css("color", "white")
        $(this).css("background", "white")
    });

    $(document).on("mouseover",".ville_double_artistes",function () {
        var hip = $(this).prev()
        hip.css("background", "rgba(255, 208, 7, 1)")
        $(this).css("color", "rgba(255, 208, 7, 1)")
    });

    $(document).on("mouseout",".ville_double_artistes",function () {
        var hip = $(this).prev()
        hip.css("background", "white")
        $(this).css("color", "white")
    });

    multiArtistes_fromCity = function(el){
      $("#consignes2").css("display", "none")
      //Fonction qui se lance quand on fait un choix entre plusieurs chansons pour la même ville
      id_choisi_fromCity = $(el).attr("id")
      var ckbox = $("#aleatoire_continent");
      var ckbox_proche = $("#aleatoire_proche");

      $("#multiliste div").removeClass("nowplaying_puce")
      $("#multiliste p").removeClass("enJaune")
      $(el).prev().addClass("nowplaying_puce")
      $(el).addClass("enJaune")


      d3.select(".lesCercles").selectAll("path").attr("fill", "rgba(255, 208, 7, 1)").attr("stroke-width", "1px")

      //Mettre tous les pays dans le bon gris
      for(var j=0;j<tableau.length;j++){
        if(tableau[j].artiste == id_choisi_fromCity){
          //return "rgba(178,178,178,1)"
          iso3 = tableau[j].iso3
          ville = tableau[j].ville
        }
      }



      g.selectAll("path")
        .attr("fill", function(d){
          for(var j=0;j<tableau.length;j++){
            if(tableau[j].iso3 == d.properties.iso_a3){
              return "rgba(178,178,178,1)"
            }

          }
          return "rgba(217,217,217,1)"
        })

      //Mettre le bon cliqué en jaune (si une chanson au moins y est associée)
      $("#"+iso3).attr("fill", function(){
        for(var j=0;j<tableau.length;j++){
          if(tableau[j].iso3 == iso3){
            return "rgba(255, 208, 7, 1)"
          }
        }
      })


      //Comme d'hab on boucle dans le tableau pour récupérer les infos
      for(var i=0;i<tableau.length;i++){
        if(tableau[i].artiste == id_choisi_fromCity){
          var url_video = tableau[i].url
          var track_choisi = tableau[i].track
          var artiste_choisi = tableau[i].artiste
          var album_choisi = tableau[i].album
          var annee_choisie = tableau[i].annee
          var continent = tableau[i].continent
          var pays = tableau[i].pays
          var ville = tableau[i].ville
          var iso = tableau[i].iso3

          lat = tableau[i].latitude
          long = tableau[i].longitude
          // continent = tableau[i].continent
          // $("#player_controls").fadeIn(0)

        }
      }

      //Faire tourner le globe pour centrer sur la ville cliquée
      d3.transition()
        .duration(1200)
        .tween("rotate", function() {
          var r = d3.interpolate(projection.rotate(), [-long, -lat, 0]);
          return function(t) {
          projection.rotate(r(t));
          pathG.selectAll("path").attr("d", path)
        };
      })

      playNewVid(url_video.slice(32))
      compteur(pays, iso)

      //Recaler les infos de la chanson dans le now playing
      $("#now_playing").slideDown(150)
      $(".lecture_aleatoire").slideDown(150)
      $("#ville_nowplaying").html("<span onClick=\"backToTrack()\">"+ville+" ("+pays+")</span>")
      // $("#pays_nowplaying").html()
      $("#artiste_nowplaying").html(artiste_choisi)
      $("#track_nowplaying").html(track_choisi)
      $("#album_nowplaying").html(" ("+album_choisi+", "+annee_choisie+")")

      $("#lien_youtube").html("<a href=\""+url_video+"\" target=\"_blank\"><img src=\"logo_youtube-01.png\" width=\"25px\" title=\"Voir le clip sur Youtube\"></a>")

      //Et afficher l'image du volume
      $("#image_volume").show();

      $(".lesCercles #"+ville.split(' ').join('')).attr("fill", "white").attr("stroke-width", "2px")
    }


    //Quand on clique sur le bouton suivant...
    $("#player_next_button").click(function(){
      $("#multiliste div").removeClass("nowplaying_puce")
      $("#multiliste p").removeClass("enJaune")
      //LECTURE ALEATOIRE CUSTOMISEE
      //Créer les variables
      var ckbox = $("#aleatoire_continent");
      var ckbox_proche = $("#aleatoire_proche");
      var ckbox_pays = $("#aleatoire_pays");
      var aleatoire_continent;
      var aleatoire_pays;
      var randomLigne;
      var urlNextSong;

      //console.log(continent)

      d3.select(".lesCercles").selectAll("path").attr("fill", "rgba(255, 208, 7, 1)").attr("stroke-width", "1px")

      chanson_proche()

      //Vérifier si la checkbox continent est cochée ou non
      if(ckbox.is(":checked")){
        //Variable témoin
        aleatoire_continent = "oui"
        aleatoire_pays = "non"
        //Tableau temporaire vide pour stocker toutes les tracks du même continent
        var tableauContinent = [];

        //Bouclette dans le tableau pour récup toutes les url du même continent
        for(var warm=0;warm<tableau.length;warm++){
          if(tableau[warm].continent == continent){
            // console.log(tableau[warm].track)
            tableauContinent.push(tableau[warm].url)
          }
        }

        //Balancer une url du même continent au hasard
        randomLigne = Math.floor(Math.random() * tableauContinent.length) + 1
        urlNextSong = tableauContinent[randomLigne]
        playNewVid(urlNextSong.slice(32))
        var trackEnCours = track


        //Utiliser l'url comme id pour récup les infos du track dans le tableau principal
        for(var santiago=0;santiago<tableau.length;santiago++){
          if(tableau[santiago].url == urlNextSong){
            // console.log(tableau[warm].track)
            //Ce qui permet de lancer les fonctions qui remplissent les infos et updatent les infogs
            trajet(tableau[santiago].latitude, tableau[santiago].longitude, tableau[santiago].track, trackEnCours)
            randomSong(tableau[santiago].artiste)
            compteur(tableau[santiago].pays, tableau[santiago].iso3)
          }
        }
      //Si la checkbox continent n'est pas cochée...
          }else if(ckbox_proche.is(":checked")){


            fire_chanson_proche()


        //Et on lance toutes les shits
        var trackEnCours = track
        aleatoire_continent = "non"
        aleatoire_pays = "non"

        urlNextSong = laFuckingLigneQuIlFaut.urlOther
        playNewVid(urlNextSong.slice(32))
        trajet(laFuckingLigneQuIlFaut.latOther, laFuckingLigneQuIlFaut.longOther, laFuckingLigneQuIlFaut.trackOther, trackEnCours)
        randomSong(laFuckingLigneQuIlFaut.artisteOther)
        compteur(laFuckingLigneQuIlFaut.paysOther, laFuckingLigneQuIlFaut.iso3Other)

      //Si la checkbox distance n'est pas cochée...
          }else if(ckbox_pays.is(":checked")){
        //Variable témoin
        aleatoire_pays = "oui"
        aleatoire_continent = "non"
        //Tableau temporaire vide pour stocker toutes les tracks du même continent
        var tableauPays = [];

        //Bouclette dans le tableau pour récup toutes les url du même continent
        for(var s=0;s<tableau.length;s++){
          if(tableau[s].pays == nompays){
            // console.log(tableau[warm].track)
            tableauPays.push(tableau[s].url)
          }
        }

        //Balancer une url du même continent au hasard
        randomLigne = Math.floor(Math.random() * tableauPays.length) + 1
        urlNextSong = tableauPays[randomLigne]
        playNewVid(urlNextSong.slice(32))
        var trackEnCours = track


        //Utiliser l'url comme id pour récup les infos du track dans le tableau principal
        for(var santiago=0;santiago<tableau.length;santiago++){
          if(tableau[santiago].url == urlNextSong){
            // console.log(tableau[warm].track)
            //Ce qui permet de lancer les fonctions qui remplissent les infos et updatent les infogs
            trajet(tableau[santiago].latitude, tableau[santiago].longitude, tableau[santiago].track, trackEnCours)
            randomSong(tableau[santiago].artiste)
            compteur(tableau[santiago].pays, tableau[santiago].iso3)
          }
        }
      //Si rien n'est coché...
          }else{
            var trackEnCours = track
            aleatoire_continent = "non"
        randomLigne = Math.floor(Math.random() * tableau.length) + 1
        urlNextSong = tableau[randomLigne].url
        playNewVid(urlNextSong.slice(32))
        trajet(tableau[randomLigne].latitude, tableau[randomLigne].longitude, tableau[randomLigne].track, trackEnCours)
        randomSong(tableau[randomLigne].artiste)
        compteur(tableau[randomLigne].pays, tableau[randomLigne].iso3)

        //console.log(tableau[randomLigne].ville)
        // afficherInfos(tableau[randomLigne].ville)
        // $("#"+tableau[randomLigne].artiste).addClass("enJaune")
          }

          d3.select(".lesCercles").selectAll("path").attr("fill", "rgba(255, 208, 7, 1)")

      for(var j=0;j<tableau.length;j++){
        if(tableau[j].track == track){
          ville = tableau[j].ville
          artiste = tableau[j].artiste
          console.log(artiste)
        }
      }

      //Afficher les infos sur la ville jouée dans le panneau de gauche
      afficherInfos(ville)
      // $("#"+artiste).addClass("enJaune")


      $(".lesCercles #"+ville.split(' ').join('')).attr("fill", "white").attr("stroke-width", "2px")

    })

    //Fonction qui lance une random song
    randomSong = function(el){
      for(var i=0;i<tableau.length;i++){
        if(tableau[i].artiste === el){
          nompays = tableau[i].pays
          nomville = tableau[i].ville
          track = tableau[i].track
          artiste = tableau[i].artiste
          album = tableau[i].album
          annee = tableau[i].annee
          count = tableau[i].nbville
          url = tableau[i].url
          continent = tableau[i].continent
          long = tableau[i].longitude
              lat = tableau[i].latitude
              iso3 = tableau[i].iso3
        }
      }

      d3.select(".lesCercles").selectAll("path").attr("fill", "rgba(255, 208, 7, 1)").attr("stroke-width", "1px")
      $(".lesCercles #"+nomville).attr("fill", "white").attr("stroke-width", "2px")

      // Vider les conteneurs de texte
      //$("#nomville, #nompays, #reste, #artiste, #track, #album, #continent").html("")
      //$("#nomville").html("<span onClick=\"backToTrack()\">"+nomville+"</span> <span id=\"nompays\">("+nompays+")</span>")


      $("#artiste_nowplaying").html(artiste)
      $("#album_nowplaying").html(" ("+album+", "+annee+")")
      $("#track_nowplaying").html(track)
      $("#ville_nowplaying").html("<span onClick=\"backToTrack()\">"+nomville+" ("+nompays+")</span>")
      //$("#continent").html(continent)
      $("#lien_youtube").html("<a href=\""+url+"\" target=\"_blank\"><img src=\"logo_youtube-01.png\" width=\"25px\" title=\"Voir le clip sur Youtube\"></a>")

      //Faire tourner le globe pour centrer sur la ville cliquée
      d3.transition()
        .duration(1200)
        .tween("rotate", function() {
          var r = d3.interpolate(projection.rotate(), [-long, -lat, 0]);
          return function(t) {
          projection.rotate(r(t));
          pathG.selectAll("path").attr("d", path)
        };
      })

      //Colorer le pays de la ville en noir
      g.selectAll("path")
        .attr("fill", function(d){
          // console.log(this.id, ville)
          var isoPays = d.properties.iso_a3

          for(var j=0;j<tableau.length;j++){
            if(tableau[j].ville === nomville){
              if(tableau[j].iso3 == this.id){
                return "rgba(255, 208, 7, 1)"
              }
            }
          }
          for(var j=0;j<tableau.length;j++){
            if(tableau[j].iso3 === isoPays){
              return "rgba(178,178,178,1)"
            }
          }
          return "rgba(217,217,217,1)"
        })

    }


    trajet = function(latFin, longFin, trackFin, trackDebut){

      //$("#compteur_distances").fadeIn(200)

      for(var v=0;v<tableau.length;v++){
        if(tableau[v].track == trackDebut){
          var latDebut = tableau[v].latitude
          var longDebut = tableau[v].longitude
          var villeDebut = tableau[v].ville
          var paysDebut = tableau[v].pays
          break;
        }
      }

      for(var w=0;w<tableau.length;w++){
        if(tableau[w].track == trackFin){
          var villeFin = tableau[w].ville
          var paysFin = tableau[w].pays
          break;
        }
      }

      id_line = "from_"+villeDebut
      latDebut = lat
      longDebut = long


      distance = function(lat1, lon1, lat2, lon2, unit) {
        var radlat1 = Math.PI * lat1/180
        var radlat2 = Math.PI * lat2/180
        var theta = lon1-lon2
        var radtheta = Math.PI * theta/180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist)
        dist = dist * 180/Math.PI
        dist = dist * 60 * 1.1515
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        return dist
      }

      // console.log(distance(latDebut, longDebut, latFin, longFin, "K"))


      if(firstTimeDistance == "oui"){
        newDistance = distance(latDebut, longDebut, latFin, longFin, "K")
        distanceTotale = newDistance
      }else{
        newDistance = distance(latDebut, longDebut, latFin, longFin, "K")
        distanceTotale = newDistance + distanceTotale
      }



      //console.log("Distance entre "+ villeDebut + " et " + villeFin + " : " + newDistance + " (distance totale = " + distanceTotale + ")")

      historiqueDistance.push({
            "villeDebut" : villeDebut,
            "villeFin" : villeFin,
            "paysDebut" : paysDebut,
            "paysFin" : paysFin,
            "newDistance" : newDistance
        });

        historiqueDistance.sort(function(b, a){return a.newDistance - b.newDistance});

        distanceMax = historiqueDistance[0].newDistance
        villeMaxDebut = historiqueDistance[0].villeDebut
        villeMaxFin = historiqueDistance[0].villeFin
        paysMaxDebut = historiqueDistance[0].paysDebut
        paysMaxFin = historiqueDistance[0].paysFin


      $("#total_distances").html("<span class=\"engras\">Vous avez parcouru</span><br><span class=\"span_total\">" + sepMil(Math.round(distanceTotale)) + " km</span>")
      $("#grande_distance").html("<span class=\"engras\">Distance la plus longue</span><br>" + villeMaxDebut + " (" + paysMaxDebut + ") > " + villeMaxFin + " (" + paysMaxFin + ")<br><span class=\"span_total\">" + sepMil(Math.round(distanceMax)) + " km</span>")
      //console.log(trackDebut, latDebut, longDebut, trackFin, latFin, longFin)

      if(firstTimeDistance =="oui"){
        firstTimeDistance = "non"
        onglet_distances_ouvert = "oui"
        $("#compteur_distances").css("top", function(){
          return hauteur - $(this).height()+"px"
        })
      }

    }

    writeCityNames = function(){
      labels = d3.select(".typo_cercles").selectAll("text")
        .data(produce2)
        .enter().append("text")
        .attr("class", "label_villes")
        .text(function(d) { return d.name; })

      villesAffichees = "oui"

    }


    deleteCityNames = function(){
      d3.select(".typo_cercles").remove()
      villesAffichees = "non"
    }

    position_labels = function() {
      var centerPos = projection.invert([width/2,height/2]);
      var arc = d3.geo.greatArc();

      d3.select(".typo_cercles").selectAll("text")
        .attr("x", function(d){
          return projection([d.longitude, d.latitude])[0];
        })
        .attr("y", function(d){
          return projection([d.longitude, d.latitude])[1];
        })
        .attr("dy", function(d){
          if(d.name=="Corbeil-Essonnes"){
          var bbox = this.getBBox();
          var width = bbox.width;
          var height = bbox.height;
          console.log(width, height)
            return height/100*80 + "px"
          }else if(d.name=="Bruxelles" || d.name=="New-York" || d.name=="Saint-Denis" || d.name=="Paris"){
            var bbox = this.getBBox();
          var width = bbox.width;
          var height = bbox.height;
          console.log(width, height)
          return "-"+ height/100*50 + "px"
          }else{
            return ".35em"
          }
        })
        // .attr("dx", ".35em")
        .attr("dx", function(d){
          //console.log(d.name)
        if(d.name=="Caen" || d.name=="Elancourt" || d.name=="Jerez de la Frontera" || d.name=="Casablanca" || d.name=="Waterloo" || d.name=="Brighton" || d.name=="Breaux Bridge" || d.name=="Atlanta" || d.name=="Petersburg" || d.name=="Newark" || d.name=="Ottawa" || d.name=="San Francisco" || d.name=="New-York" || d.name=="Bruxelles"|| d.name=="Paris"){
          var bbox = this.getBBox();
          var width = bbox.width;
          var height = bbox.height;
          console.log(width, height)
            return "-" + width/100*110 + "px"
          }else{
            return ".35em"
          }
      })
        .style("display",function(d) {
          var d = arc.distance({source: [d.longitude, d.latitude], target: centerPos});
          return (d > 1.57) ? 'none' : 'inline';
        });
    }

    //Pour afficher/masquer le panneau des distances
    $("#onglet_distances").click(function(){
      if(onglet_distances_ouvert == "oui"){
        $("#compteur_distances").css("top", "100vh")
        onglet_distances_ouvert = "non"
      }else{
        $("#compteur_distances").css("top", function(){
          return hauteur - $(this).height()+"px"
        })
        onglet_distances_ouvert = "oui"
      }
    })


    //Pour voir la liste de chansons
    $("#voir_liste, #voir_liste2").click(function(){
      $("#the_liste").html("")
      voirListe()
      $("#conteneur_liste").fadeIn(200)
      $("#formulaire").fadeOut(200)
    })


    $("#conteneur_liste").click(function(){
      $("#conteneur_liste").fadeOut(200)
    })

    //Pour envoyer des chansons via le formulaire
    $("#proposez, #proposez2").click(function(){
      $("#the_liste").html("")

      $("#formulaire").css("height", function(){
        return hauteur+"px"
      })

      $("#conteneur_liste").fadeIn(200)
      $("#formulaire").fadeIn(200)

    })

    //Pour les remerciements
    $("#pleindegens, #pleindegens2").click(function(){
      $("#the_liste").html("")
      var remerciements = "<h2 class=\"titre_remerciements\">Remerciements</h2><p class=\"liste_remerciements\">Un grand merci à toutes les personnes qui ont donné un coup de main dans la réalisation de ce projet. Une pensée toute particulière pour Florian Coppenrath de <a href=\"https://www.novastan.org/fr/\" target=\"_blank\">Novastan</a> pour ses références sur le hip-hop d'Asie centrale, à Nicolas Keraudren pour l'Afrique, à l'impeccable chaîne Youtube <a href=\"https://www.youtube.com/channel/UC2Qw1dzXDBAZPwS7zm37g8g/\" target=\"_blank\">Colors</a> pour ses références internationales, à @ChatonP_Elohim, @florianbourmaud et @madame_rap pour leurs très nombreuses propositions.<br><br>Merci à vous tous qui nous envoyez vos références : @louisebouttier, @PhilippeGargov, @Badalssim, @Oneestlaa, @articlequinze, @xpennec, @nerik, @florianbourmaud, @aleduc0, @TamaraBouhl, @Barthemius, @jeanabbiateci, @fabiostorpa, @djricekookerz, @mart1oeil, @PaulM_C, @UncleKilian, @amhauchard, @jegojulien, Thomas Labrune, Barnabé Bourgeois, @Crctrstq, @Clairelebrunn, Trub, @QAuzanneau, Jeff D.<br><br>Enfin, merci aussi à l'équipe de bêta-testeurs : Arnaud Poilleux, Jean-Philippe Louis, Caroline Davour, Alexandre Rousset, Marc Bettinelli, Jean-Félix Dealberto et Pierre Breteau.</p>"

      $("#the_liste").html(remerciements)

      $("#conteneur_liste").fadeIn(200)
      $("#formulaire").fadeOut(0)

    })


    $("#aleatoire_continent").change(function(){
      if($(this).is(":checked")) {
              $('#aleatoire_proche').attr('checked', false);
              $('#aleatoire_pays').attr('checked', false);
          }
    })

    $("#aleatoire_proche").change(function(){
      if($(this).is(":checked")) {
              $('#aleatoire_continent').attr('checked', false);
              $('#aleatoire_pays').attr('checked', false);
              tableauHistorique = [];
          }else{
            tableauHistorique = [];
          }
    })

    $("#aleatoire_pays").change(function(){
      if($(this).is(":checked")) {
              $('#aleatoire_proche').attr('checked', false);
              $('#aleatoire_continent').attr('checked', false);
          }
    })

    $("#backToTrack").click(function(){
      backToTrack()
    })

    backToTrack = function(){
      console.log(track)
      for(var ringo=0;ringo<tableau.length;ringo++){
        if(tableau[ringo].track == track){
          recentLat = tableau[ringo].latitude
          recentLong = tableau[ringo].longitude
        }
      }

      d3.transition()
        .duration(1200)
        .tween("rotate", function() {
          var r = d3.interpolate(projection.rotate(), [-recentLong, -recentLat, 0]);
          return function(t) {
          projection.rotate(r(t));
          pathG.selectAll("path").attr("d", path)
        }
      })
    }


    chanson_proche = function(){
      //Fonction qui calcule les distances entre deux points
        distance = function(lat1, lon1, lat2, lon2, unit) {
          var radlat1 = Math.PI * lat1/180
          var radlat2 = Math.PI * lat2/180
          var theta = lon1-lon2
          var radtheta = Math.PI * theta/180
          var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
          dist = Math.acos(dist)
          dist = dist * 180/Math.PI
          dist = dist * 60 * 1.1515
          if (unit=="K") { dist = dist * 1.609344 }
          if (unit=="N") { dist = dist * 0.8684 }
          return dist
        }

        //console.log(distance(lat, long, 48.856614, 2.3522219, "K"))

        var latTrack = lat;
        var longTrack = long;

        tableauDistances = [];

        //Puis celles de toutes les autres tracks
        for(var a=0;a<tableau.length;a++){
          var latOther = tableau[a].latitude;
          var longOther = tableau[a].longitude;
          var urlOther = tableau[a].url
          var artisteOther = tableau[a].artiste
          var trackOther = tableau[a].track
          var paysOther = tableau[a].pays
          var iso3Other = tableau[a].iso3
          var villeOther = tableau[a].ville

          //Petite condition pour virer les éventuelles tracks issues de la même ville dans le tableauDistances
          if(latTrack == latOther || longTrack == longOther){

          }else{
            //tableauDistances.push(distance(lat, long, latOther, longOther, "K"))
              tableauDistances.push({
                  "artisteOther" : artisteOther,
                  "paysOther" : paysOther,
                  "villeOther" : villeOther,
                  "iso3Other" : iso3Other,
                  "trackOther" : trackOther,
                  "urlOther" : urlOther,
                  "latOther" : latOther,
                  "longOther" : longOther,
                  "distance" : distance(lat, long, latOther, longOther, "K")
              });
          }

        }
    }

    fire_chanson_proche = function(){
      // Dejà on récupère la ville jouée actuellement
        for(var v=0;v<tableau.length;v++){
          if(tableau[v].track == track){
            var daTrack = tableau[v].track;
            break;
          }
        }

        //Ensuite on la cale dans le tableau de l'historique
        tableauHistorique.push(daTrack);
        console.log(tableauHistorique)

        //On supprime cette ville jouée du tableau des distances
        var filtered = tableauDistances.filter(function(el) { return el.trackOther != daTrack; });

        //Puis on rétro boucle dans le tableau des distances pour supprimer chaque objet présent dans le tableau historique
        for(var i = 0; i < filtered.length; i++) {
            var obj = filtered[i];

            if(tableauHistorique.indexOf(obj.trackOther) !== -1) {
                filtered.splice(i, 1);
                i--;
            }
        }

        //Du coup il ne reste dans le tableau des distances que les villes qui n'ont pas encore été jouées
        console.log(filtered)

        //On trie le tableau des distances du plus petit au plus grand
        filtered.sort(function(a, b){return a.distance - b.distance});

        //Et on renvoie la première ligne : celle de la chanson non-jouée la plus proche
        laFuckingLigneQuIlFaut = filtered[0]
    }


    function resetZoom(){

    }

    compteur = function(pays, codeiso){
      //Historique de la playlist dans un tableau
      tableCompteur.push(pays)
      tableauISO.push(codeiso)

      //Tableaux vides pour crisé dynamique
      compteurPaysUniques = [];
      compteurTemp = [];


      //Count par pays
      for(var i=0;i<tableCompteur.length;i++){
        if(compteurTemp.indexOf(tableCompteur[i]) == -1){
          compteurTemp.push(tableCompteur[i]);
          var _data = {};
          _data.nompays = tableCompteur[i];
          _data.count = 1;

          compteurPaysUniques.push(_data);
        }else{
          for(var j=0;j<compteurPaysUniques.length;j++){
            if(compteurPaysUniques[j].nompays === tableCompteur[i]){
              var _x = parseInt(compteurPaysUniques[j].count) + 1;
              compteurPaysUniques[j].count = _x;
            }
          }
        }
      }

      // console.log(compteurPaysUniques)

      //Trier du plus grand au plus petit
      compteurPaysUniques.sort(function(a, b){return b.count - a.count});

      //Vider le graphique
      $("#conteneur_noms, #conteneur_chiffres, #conteneur_barres").empty()

      //Recréer le graphique
      for(var i=0; i<compteurPaysUniques.length; ++i){
             $("#conteneur_noms").append("<span class=\"txt1\"><b>"+compteurPaysUniques[i].nompays +"</b></span><br/>");
             $("#conteneur_chiffres").append("(<span class=\"txt1\">"+compteurPaysUniques[i].count +"</span>)<br/>");
             $("#conteneur_barres").append("<div id=\""+compteurPaysUniques[i].nompays+"\" class=\"barreGraphe\"></div>")
             $(".barreGraphe").css("width", function(){
                if(this.id==compteurPaysUniques[i].nompays){
                  var width_conteneur = $("#conteneur_barres").width()
                    return compteurPaysUniques[i].count * 4 +"px"
                }
             })
        }



        //Mettre à jour la carte
      for(var ho=0;ho<tableauISO.length;ho++){

        $(".calque_pays #"+tableauISO[ho]).attr("fill", "rgba(0, 0, 0, 0.8)")
      }



    }//Fin de la fonction compteur

    $("#remettreZero").click(function(){
      //Tableau de droite
      tableCompteur = []
      tableauISO = []
      $(".calque_pays path").attr("fill", "rgba(0,0,0,0.2)")
      $("#conteneur_noms, #conteneur_chiffres, #conteneur_barres").empty()

      //Distances
      firstTimeDistance = "oui"
      historiqueDistance = []
      g_trajet.selectAll("path").remove()
      $("#total_distances, #grande_distance").html("")
      $("#compteur_distances").css("top", function(){
        return hauteur - $(this).height()+"px"
      })
    })

    $("#reinit_distance").click(function(){
      //Distances
      firstTimeDistance = "oui"
      // onglet_distances_ouvert = "non"
      historiqueDistance = []
      g_trajet.selectAll("path").remove()
      $("#total_distances, #grande_distance").html("")
      $("#compteur_distances").css("top", function(){
        return hauteur - $(this).height()+"px"
      })

      //Panneau de droite
      tableCompteur = []
      tableauISO = []
      $(".calque_pays path").attr("fill", "rgba(0,0,0,0.2)")
      $("#conteneur_noms, #conteneur_chiffres, #conteneur_barres").empty()
    })


    function voirListe(){
      //COMPTER LE NOMBRE DE PAYS UNIQUES
      temp2 = [];
      pays_uniques = [];
      console.log(tableau)

      for(var i=0;i<tableau.length;i++){
        if(temp2.indexOf(tableau[i].pays) == -1){
          temp2.push(tableau[i].pays);
          var _data = {};
          _data.nompays = tableau[i].pays;
          _data.iso3 = tableau[i].iso3;
          _data.count = 1;

          pays_uniques.push(_data);
        }else{
          for(var j=0;j<pays_uniques.length;j++){
            if(pays_uniques[j].iso3 === tableau[i].iso3){
              var _x = parseInt(pays_uniques[j].count) + 1;
              pays_uniques[j].count = _x;
            }
          }
        }
      }

      //Les trier par ordre alphabétique
      pays_uniques.sort(function(a, b) {
        return compareStrings(a.nompays, b.nompays);
      })

      //Appender un li pour chaque pays
      for(var i=0;i<pays_uniques.length;i++){
        var liste_pays_unique = pays_uniques[i].nompays
        $("#the_liste").append("<h3 class=\"liste_titre_pays\">"+pays_uniques[i].nompays+" ("+pays_uniques[i].count+")</h3><ul class=\"liste_pays\" id=\"liste_"+pays_uniques[i].iso3+"\"></ul>")
      }

      for(var i=0;i<tableau.length;i++){
        liste_artiste = tableau[i].artiste
        liste_iso3 = tableau[i].iso3
        liste_track = tableau[i].track
        liste_nompays = tableau[i].pays
        //Puis un nouveau pour chaque artiste
        $("#liste_"+liste_iso3).append("<li>"+liste_track+" ("+liste_artiste+")")
      }
    }

    $(function() {
      var positionCentre = { my: 'center bottom-40', at: 'center top' };
      $("svg").tooltip({
            track: true,
            show: {
              effect: "fade",
                duration: 0
            },
            hide: {
                effect: "fade",
                duration: 100
            },
            position: positionCentre,
          items: "path",
            content: function() {
          return $( this ).attr( "title" );
            }
         });
    });

    $("#bouton_entrer").click(function(){
      $("#cache").fadeOut(30)
    })

    // $("#phrase_preload, .logo_preload").delay(400).fadeOut(20)
    $("#phrase_preload, .logo_preload").css("display", "none")
    $("#wrap_intro").fadeIn(20)

  }//FIN DE LA FONCTION LETSGEAUX



  function compare(a,b) {
    if (b.nbville < a.nbville)
      return -1;
    if (b.nbville > a.nbville)
      return 1;
    return 0;
  }

  function compare2(a,b) {
    if (b.count < a.count)
      return -1;
    if (b.count > a.count)
      return 1;
    return 0;
  }

  function compareStrings(a, b) {
      // Assuming you want case-insensitive comparison
      a = a.toLowerCase();
      b = b.toLowerCase();

      return (a < b) ? -1 : (a > b) ? 1 : 0;
    }

  //Fonction qui permet de calculer une aire
  aire = function(value){
    return Math.sqrt(value/3.1415)
  }

  //Fonction qui met des espaces en séparateurs de milliers
  function sepMil(input) {
      var output = input
      if (parseFloat(input)) {
          input = new String(input); // so you can perform string operations
          var parts = input.split("."); // remove the decimal part
          parts[0] = parts[0].split("").reverse().join("").replace(/(\d{3})(?!$)/g, "$1 ").split("").reverse().join("");
          output = parts.join(".");
      }

      return output;
  }

})

$(window).resize(function () {
  responsive()

})

$(document).scroll(function() {


});

$('.conteneur').bind('mousewheel', function(e){
  $("#gifscroll").fadeOut(20)
})

})//FIN DU DUCOUMENT.READY



