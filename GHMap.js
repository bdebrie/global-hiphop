    class GHMap {
      constructor() {
        this.shouldYouTurn = 1;
        this.villesAffichees = 0;
        this.didYouJustDezoom = 0;
        this.resetScale = 200;
        this.tableCompteur = [];
        this.tableauISO = [];
        this.tableauHistorique = [];
        this.distanceTotale = 0;
        this.firstTimeDistance = 1;
        this.onglet_distances_ouvert = 0;
        this.historiqueDistance = [];
        this.countries = false;
      }

      getCountries () {
        $.getJSON('source/countries.json', (json) => {
          this.countries = json;
        });
      }
    }


