var game = new Phaser.Game(1024, 768, Phaser.CANVAS, 'game');

var play = {
    preload: function () {
        this.tabLine = [];
        this.tabGame = [];
        this.nbColonnes = 8;
        this.nbLignes = 8;
        game.load.image('orange', './images/20.png');
        game.load.image('bleu', './images/21.png');
        game.load.image('violet', './images/22.png');
        game.load.image('vert', './images/23.png');
        game.load.image('rouge', './images/24.png');
        this.tailleCase = 64;
        this.latenceClick = 200;
        this.nextClick = 0;
        this.clickedCase = [];
    },
    create: function () {

        //calcul coord de départ
        this.startCoord();

        //traçage des lignes
        this.gridViewTrace();

        //création de la grille de jeu
        for (var ligne = 0; ligne < this.nbLignes; ligne++) {
            this.tabGame.push(new Array(this.nbColonnes));
        }

        //remplir la grille de jeu
        for (var ligne = 0; ligne < this.nbLignes; ligne++) {
            for (var colonne = 0; colonne < this.nbColonnes; colonne++) {
                this.tabGame[ligne][colonne] = this.random(0, 4);
            }
        }

        //affichage des picos dans la grille
        for (var ligne = 0; ligne < this.nbLignes; ligne++) {
            for (var colonne = 0; colonne < this.nbColonnes; colonne++) {
                //cacul de x y pour placé l'image
                var x = this.startX + (this.taillePico * colonne);
                var y = this.startY + (this.taillePico * ligne);
                switch (this.tabGame[ligne][colonne]) {
                    case 0:
                        var gemme = game.add.sprite(x, y, 'orange');
                        break;
                    case 1:
                        var gemme = game.add.sprite(x, y, 'bleu');
                        break;
                    case 2:
                        var gemme = game.add.sprite(x, y, 'violet');
                        break;
                    case 3:
                        var gemme = game.add.sprite(x, y, 'vert');
                        break;
                    case 4:
                        var gemme = game.add.sprite(x, y, 'rouge');
                        break;
                    default:
                        console.log('allo houston on a un pb ! pas de pico pour ce chiffre');
                }
                this.tabGame[ligne][colonne] = gemme;
            }
        }
    },
    update: function () {
        //gestion de l'editeur
        var caseX = Math.floor((game.input.activePointer.x - this.startX) / this.taillePico);
        var caseY = Math.floor((game.input.activePointer.y - this.startY) / this.taillePico);

        if (game.input.activePointer.leftButton.isDown
            && caseY < this.nbLignes
            && caseY >= 0
            && caseX >= 0
            && caseX < this.nbColonnes
            && game.time.now > this.nextClick) {

            this.nextClick = game.time.now + this.latenceClick;

            clickCaseX = caseX;
            clickCaseY = caseY;
            
            var nbClick = Object.keys(this.clickedCase).length;
            if (nbClick > 0
                && (this.clickedCase["first"].x != clickCaseX || this.clickedCase["first"].y != clickCaseY) //pas la mm case
                && this.isAdjacent(clickCaseX, clickCaseY) //et une case adjacente 
                ) {
                this.clickedCase["second"] = { x: clickCaseX, y: clickCaseY };
                this.changeColor(this.clickedCase["first"].x, this.clickedCase["first"].y, 1);
                //intervertir les jetons
                var tmpJetonFirst = this.tabGame[this.clickedCase["first"].y][this.clickedCase["first"].x];
                var oldFirstX = tmpJetonFirst.x;
                var oldFirstY = tmpJetonFirst.y;

                var tmpJetonSecond = this.tabGame[this.clickedCase["second"].y][this.clickedCase["second"].x];
                var oldSecondX = tmpJetonSecond.x;
                var oldSecondY = tmpJetonSecond.y;

                this.tabGame[this.clickedCase["first"].y][this.clickedCase["first"].x] = tmpJetonSecond;
                this.tabGame[this.clickedCase["first"].y][this.clickedCase["first"].x].x = oldFirstX;
                this.tabGame[this.clickedCase["first"].y][this.clickedCase["first"].x].y = oldFirstY;
                
                this.tabGame[this.clickedCase["second"].y][this.clickedCase["second"].x] = tmpJetonFirst;
                this.tabGame[this.clickedCase["second"].y][this.clickedCase["second"].x].x = oldSecondX;
                this.tabGame[this.clickedCase["second"].y][this.clickedCase["second"].x].y = oldSecondY;

                //maj affichage
                this.tabGame[this.clickedCase["first"].y][this.clickedCase["first"].x].update();
                this.tabGame[this.clickedCase["second"].y][this.clickedCase["second"].x].update();

                //validé le coup first et second
                //si ok supprimé les bonbons
                //descendre les bonbons dans les cases vides
                //remplir les cases vides par le haut
                //sinon roll back
                //reset clickedCase
                delete this.clickedCase['second'];
                delete this.clickedCase['first'];

            } else {

                if (nbClick == 0) {
                    this.clickedCase["first"] = { x: clickCaseX, y: clickCaseY };
                } else if (nbClick == 1) {
                    this.changeColor(this.clickedCase["first"].x, this.clickedCase["first"].y, 1);
                    this.clickedCase["first"] = { x: clickCaseX, y: clickCaseY };
                } else if (nbClick > 1) {
                    this.changeColor(this.clickedCase["first"].x, this.clickedCase["first"].y, 1);
                    this.clickedCase["first"] = { x: clickCaseX, y: clickCaseY };
                    delete this.clickedCase['second'];
                }
                this.changeColor(this.clickedCase["first"].x, this.clickedCase["first"].y, 0.5);
            }
        }
    },
    render: function () {
        for (var i = 0; i < this.tabLine.length; i++) {
            game.debug.geom(this.tabLine[i], 'LightSeaGreen');
        }
    },
    gridViewTrace: function () {
        for (var i = 0; i <= this.nbColonnes; i++) {
            this.tabLine.push(new Phaser.Line((this.startX + (this.tailleCase * i)), this.startY, (this.startX + (this.tailleCase * i)), (this.startY + (this.tailleCase * this.nbLignes))));
        }
        for (var j = 0; j <= this.nbLignes; j++) {
            this.tabLine.push(new Phaser.Line(this.startX, (this.startY + (this.tailleCase * j)), (this.startX + (this.tailleCase * this.nbColonnes)), (this.startY + (this.tailleCase * j))));
        }
    },
    startCoord: function () {
        this.taillePico = game.cache.getImage('orange').width;
        this.startX = (game.world.width - (this.nbColonnes * this.taillePico)) / 2;
        this.startY = (game.world.height - (this.nbLignes * this.taillePico)) / 2;
    },
    random: function (pmin, pmax) {
        var min = Math.ceil(pmin);
        var max = Math.floor(pmax);
        var index = Math.floor(Math.random() * (max - min + 1)) + min;
        return index;
    },
    isAdjacent: function (px, py) {
        //vérifie que la case cliqué est une case adjacente a la première
        caseAdjXP1 = this.clickedCase["first"].x + 1;
        caseAdjXM1 = this.clickedCase["first"].x - 1;
        caseAdjYP1 = this.clickedCase["first"].y + 1;
        caseAdjYM1 = this.clickedCase["first"].y - 1;

        var isAdjasent = false;

        if (px == caseAdjXM1 && py == this.clickedCase["first"].y) {//(x-1,y)
            isAdjasent = true
        } else if (px == caseAdjXP1 && py == this.clickedCase["first"].y) { //(x + 1, y)
            isAdjasent = true
        } else if (px == this.clickedCase["first"].x && py == caseAdjYM1) {//(x, y - 1)
            isAdjasent = true
        } else if (px == this.clickedCase["first"].x && py == caseAdjYP1) {//(x, y + 1)
            isAdjasent = true
        }

        return isAdjasent;
    },
    changeColor: function (px, py, pAlpha) {
        var forme = this.tabGame[py][px];
        forme.alpha = pAlpha;
    }
}

game.state.add('play', play);

game.state.start('play');