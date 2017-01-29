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
        this.traitementEnCours = false;
        this.nbKilledToken = 0;
        this.nbOfhit = 0;
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
                this.tabGame[ligne][colonne] = this.randomJeton(colonne, ligne);
            }
        }

        //affichage nbHit et nbKill
        this.textNbHitString = 'Nombre de coups joués : ';
        this.textNbHit = game.add.text(10, 10, this.textNbHitString + this.nbOfhit, {
            font: "32px Arial"
            , fill: "#ffffff"
            , align: "center"
        });

        this.textNbKilledTokenString = 'Nombre jetons supprimés : ';
        this.textNbKill = game.add.text(10, 55, this.textNbKilledTokenString + this.nbKilledToken, {
            font: "32px Arial"
            , fill: "#ffffff"
            , align: "center"
        });

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
            && game.time.now > this.nextClick
            && this.traitementEnCours === false
        ) {
            this.traitementEnCours = true;
            this.nextClick = game.time.now + this.latenceClick;

            var clickCaseX = caseX;
            var clickCaseY = caseY;

            var nbClick = Object.keys(this.clickedCase).length;
            if (nbClick > 0
                && (this.clickedCase["first"].x != clickCaseX || this.clickedCase["first"].y != clickCaseY) //pas la mm case
                && this.isAdjacent(clickCaseX, clickCaseY) //et une case adjacente 
            ) {
                this.clickedCase["second"] = {x: clickCaseX, y: clickCaseY};
                this.changeColor(this.clickedCase["first"].x, this.clickedCase["first"].y, 1);
                //intervertir les jetons
                //sauvegardes des coordonnées des sprites
                //faire l'echange et bouger les sprites
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
                var validSecond = this.validateHit(this.clickedCase["second"].x, this.clickedCase["second"].y);
                var validFirst =this.validateHit(this.clickedCase["first"].x, this.clickedCase["first"].y);
                if(validFirst || validSecond){
                    this.nbOfhit++;
                }
                if(validSecond == false && validSecond == false){
                    //A faire
                    //sinon roll back
                }

                //reset clickedCase
                delete this.clickedCase['second'];
                delete this.clickedCase['first'];

            } else {

                if (nbClick == 0) {
                    this.clickedCase["first"] = {x: clickCaseX, y: clickCaseY};
                } else if (nbClick == 1) {
                    this.changeColor(this.clickedCase["first"].x, this.clickedCase["first"].y, 1);
                    this.clickedCase["first"] = {x: clickCaseX, y: clickCaseY};
                } else if (nbClick > 1) {
                    this.changeColor(this.clickedCase["first"].x, this.clickedCase["first"].y, 1);
                    this.clickedCase["first"] = {x: clickCaseX, y: clickCaseY};
                    delete this.clickedCase['second'];
                }
                this.changeColor(this.clickedCase["first"].x, this.clickedCase["first"].y, 0.5);
            }
            //maj score
            this.textNbHit.setText(this.textNbHitString + this.nbOfhit);
            this.textNbKill.setText(this.textNbKilledTokenString + this.nbKilledToken);

            this.traitementEnCours = false;
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

        return Math.floor(Math.random() * (max - min + 1)) + min;
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
    },
    validateHit: function (px, py) {
        //vérifié le nb de jeton de la mm couleur sur la ligne horizontale et verticale
        var result = this.nbJetonAdj(px, py);
        var killedCase = [];
        if (result != null) {
            if ((result.cptXM + result.cptXP + 1) >= 3) {
                killedCase.push(this.killRow(px, py, result, 'x'));
            }
            if ((result.cptYM + result.cptYP + 1) >= 3) {
                killedCase.push(this.killRow(px, py, result, 'y'));
            }
            //faire décendre les jetons sur les cases vide
            for (var i = 0; i < killedCase.length; i++) {
                for (var j = 0; j < killedCase[i].length; j++) {
                    var startCaseX = killedCase[i][j].x;
                    var startCaseY = killedCase[i][j].y;
                    var cpt = 0;
                    while ((startCaseY - cpt) >= 0) {
                        //echange 2 case en remontant
                        var tmpCase = this.tabGame[startCaseY - cpt][startCaseX];
                        if ((startCaseY - cpt - 1) >= 0) {
                            this.tabGame[startCaseY - cpt][startCaseX] = this.tabGame[startCaseY - cpt - 1][startCaseX];
                            if (this.tabGame[startCaseY - cpt][startCaseX] != null) {
                                var coordSprite = this.calculCoordSpriteInGrid(startCaseX, startCaseY - cpt);
                                this.tabGame[startCaseY - cpt][startCaseX].x = coordSprite.x;
                                this.tabGame[startCaseY - cpt][startCaseX].y = coordSprite.y;
                                this.tabGame[startCaseY - cpt][startCaseX].update();
                            }

                            this.tabGame[startCaseY - cpt - 1][startCaseX] = tmpCase;
                            if (this.tabGame[startCaseY - cpt - 1][startCaseX] != null) {
                                var coordSprite2 = this.calculCoordSpriteInGrid(startCaseX, startCaseY - cpt - 1);
                                this.tabGame[startCaseY - cpt - 1][startCaseX].x = coordSprite2.x;
                                this.tabGame[startCaseY - cpt - 1][startCaseX].y = coordSprite2.y;
                                this.tabGame[startCaseY - cpt - 1][startCaseX].update();
                            }
                        }
                        cpt++;
                    }
                }
            }
            //remplir les cases vide depuis le haut
            this.remplirCaseVide();
            return true;
        }
        return false
    },
    nbJetonAdj: function (px, py) {
        var jeton = this.tabGame[py][px];

        if (jeton != null) {
            var result = {};

            var i = px - 1;
            var cptXM = 0;
            for (i; i >= 0; i--) {
                if (this.tabGame[py][i] != null && jeton.key === this.tabGame[py][i].key) {
                    cptXM++;
                } else {
                    break;
                }
            }
            result.cptXM = cptXM;

            var j = px + 1;
            var cptXP = 0;
            for (j; j < this.nbColonnes; j++) {
                if (this.tabGame[py][j] != null && jeton.key === this.tabGame[py][j].key) {
                    cptXP++;
                } else {
                    break;
                }
            }
            result.cptXP = cptXP;

            var k = py - 1;
            var cptYM = 0;
            for (k; k >= 0; k--) {
                if (this.tabGame[k][px] != null && jeton.key === this.tabGame[k][px].key) {
                    cptYM++;
                } else {
                    break;
                }
            }
            result.cptYM = cptYM;

            var l = py + 1;
            var cptYP = 0;
            for (l; l < this.nbLignes; l++) {
                if (this.tabGame[l][px] != null && jeton.key === this.tabGame[l][px].key) {
                    cptYP++;
                } else {
                    break;
                }
            }
            result.cptYP = cptYP;

            return result;
        }
        return null;
    },
    killRow: function (px, py, pResult, pAxe) {
        //supprime les jetons d'une ligne
        var killedCase = [];
        if (pAxe == "x") {
            var xStart = px - pResult.cptXM;
            var xNbKill = pResult.cptXM + pResult.cptXP + 1;
            for (var i = 0; i < xNbKill; i++) {
                if (this.tabGame[py][xStart + i] != null) {
                    this.tabGame[py][xStart + i].destroy();
                    this.tabGame[py][xStart + i] = null;
                    killedCase.push({x: xStart + i, y: py});
                    this.nbKilledToken++;
                }
            }
        }
        if (pAxe == "y") {
            var yStart = py - pResult.cptYM;
            var yNbKill = pResult.cptYM + pResult.cptYP + 1;
            for (var j = 0; j < yNbKill; j++) {
                if (this.tabGame[yStart + j][px] != null) {
                    this.tabGame[yStart + j][px].destroy();
                    this.tabGame[yStart + j][px] = null;
                    killedCase.push({x: px, y: yStart + j});
                    this.nbKilledToken++;
                }
            }
        }
        return killedCase;
    },
    calculCoordSpriteInGrid: function (px, py) {
        var coordSprite = {};
        coordSprite.x = this.startX + (this.taillePico * px);
        coordSprite.y = this.startY + (this.taillePico * py);
        return coordSprite;
    },
    remplirCaseVide: function () {
        for (var ligne = this.nbLignes - 1; ligne >= 0; ligne--) {
            for (var colonne = this.nbColonnes - 1; colonne >= 0; colonne--) {
                if (this.tabGame[ligne][colonne] == null) {
                    this.tabGame[ligne][colonne] = this.randomJeton(colonne, ligne);
                }
            }
        }
    },
    randomJeton: function (caseX, caseY) {
        var coordSprite = this.calculCoordSpriteInGrid(caseX, caseY);
        var x = coordSprite.x;
        var y = coordSprite.y;
        var gemme = {};
        switch (this.random(0, 4)) {
            case 0:
                gemme = game.add.sprite(x, y, 'orange');
                break;
            case 1:
                gemme = game.add.sprite(x, y, 'bleu');
                break;
            case 2:
                gemme = game.add.sprite(x, y, 'violet');
                break;
            case 3:
                gemme = game.add.sprite(x, y, 'vert');
                break;
            case 4:
                gemme = game.add.sprite(x, y, 'rouge');
                break;
            default:
                console.log('allo houston on a un pb ! pas de pico pour ce chiffre');
        }
        return gemme;
    },
    test: function () {

    }
};

game.state.add('play', play);

game.state.start('play');