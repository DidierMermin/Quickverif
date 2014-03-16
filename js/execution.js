/*
	Copyright 2014 Didier Mermin
	This file is part of Quickverif.
    Quickverif is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Quickverif.  If not, see <http://www.gnu.org/licenses/>.
*/
/* Execution et affichage des tests */

	var ok = true;
	var ko = false;
	var iExec  = 0;                                        // Numero d'exécution
	var Sdelai = 0;                                        // Somme delais pour différer exécutions
	var Qdelai = 1000;                                     // Quanta de delai en ms
	var exelst = new Array();                              // Liste des fonctions lancées
	var winlst = new Array();                              // Liste des onglets ouverts
	var maxLancements = 44;                                // Nb max lancements possibles
	                                                       // ==> dépend de add_frames.xsl
	function calcURI_brajvm (bra, ijvm, alerte) {          // Calcul URI de domaine+branche+JVM
		if (bra == undefined) {
			var txt = 'Erreur: appel de calcURI_brajvm() sans objet branche.';
			(alerte) ? alert (txt) : log (txt);
			return ko;
		}
		if (bra.Dom == undefined) {
			var txt = 'Erreur: appel de calcURI_brajvm() avec objet branche sans numero de domaine.';
			(alerte) ? alert (txt) : log (txt);
			return ko;
		}
		if (ijvm < allJVM || ijvm > maxJVM) {
			var txt = 'Erreur: appel de calcURI_brajvm() avec un mauvais numero de JVM (' + ijvm + ').';
			(alerte) ? alert (txt) : log (txt);
			return ko;
		}
		var dom = domlst[bra.Dom];
		if (ijvm > dom.nbJVM) {
			var txt = 'Erreur: appel de calcURI_brajvm() avec un numero de JVM (' + ijvm + ')' +
					'\n superieur au nombre de JVM (' + dom.nbJVM + ')' +
					'\n du domaine ('+ dom.Ide + ').';
			(alerte) ? alert (txt) : log (txt);
			return ko;
		}
		if (ijvm == 0 && dom.nbJVM > 0) {
			var txt = 'Erreur: appel de calcURI_brajvm() avec numero de JVM null' +
					'\nalors que le domaine ('+ dom.Ide + ') comporte ' + dom.nbJVM + ' JVM.';
			(alerte) ? alert (txt) : log (txt);
			return ko;
		}
		/*
		Algorithme du calcul des URI = partie de l'URL avant le 1er /
		*/
		var URI = bra.Uri;
		if (ijvm == allJVM && dom.nbJVM > 0) URI += '&lt;toutes-jvm&gt;';
		if (ijvm  > 0)                       URI += dom.jvmlst[ijvm-1].Uri;
		if (dom.Pref != null && dom.Pref != '') {
			return URI + dom.Pref + dom.Uri;
		}
		if (dom.Suff != null && dom.Suff != '') {
			return dom.Uri + dom.Suff + URI;
		}
		if (dom.Uri != null && dom.Uri != '') {
			return dom.Uri + URI;
		}
		return URI;
	}
	function checkNbLancements() {
		var nbLancementsToDo = (myapp.Ide !== undefined) ? myapp.nbTST : mybra.nbTST;
		if (mydom.nbJVM > 1 && myjvm == allJVM) nbLancementsToDo *= mydom.nbJVM;
		if (mydom.nbBRA > 1 && Mono  == false)  nbLancementsToDo *= mydom.nbBRA;
		if (nbLancementsToDo <= maxLancements) return ok;
		alert ('Trop de lancements a faire.\nMax prevu = ' + maxLancements + '\nDemandes = ' + nbLancementsToDo);
		return ko;
	}
	function MultiTST() {                                  // call in pilotage.js
		if (mybra.Ide  === undefined) {alert ("Cliquez d'abord sur une branche."); return ko;}
		if (mybra.nbTST == 0)         {alert ('Aucun test pour ' + mybra.Ide);     return ko;}
		if (mydom.Ide  === undefined) {alert ("Cliquez d'abord sur une branche."); return ko;}
		if (myapp.Ide  !== undefined) {
			if (myapp.nbTST == 0) {alert ('Aucun test pour ' + myapp.Ide); return ko;}
		}
		if (!checkNbLancements()) return ko;               // Trop de lancements à faire
		RAZ();                                             // Ferme iframes précédemment ouvertes
		var i, j, app, nom, tst, ret;
		var nbREF = mybra.reflst.length;                   // applis spécifiques a la branche
		if (nbREF > 0) {
			for (i=0; i<nbREF; i++) {
				nom = mybra.reflst[i].Nom;
				app = applst[appnum[nom]];
				if (myapp.Ide != undefined && myapp.Ide != nom) continue; // Not the appli the user wants
				for (j=0; j<app.tstlst.length; j++) {
					tst = app.tstlst[j];
					ret = exeTest (app.Ide, tst.Ide);      // Execute le test
					if (!ret) return ko;
				}
			}
		}
		var nbREF = mydom.reflst.length;                   // applis du domaine
		if (nbREF > 0) {
			for (i=0; i<nbREF; i++) {
				nom = mydom.reflst[i].Nom;
				app = applst[appnum[nom]];
				if (myapp.Ide != undefined && myapp.Ide != nom) continue; // Not the appli the user wants
				for (j=0; j<app.tstlst.length; j++) {
					tst = app.tstlst[j];
					ret = exeTest (app.Ide, tst.Ide);      // Execute le test
					if (!ret) return ko;
				}
			}
		}
		return ok;
	}
	function exeTest (appID, tstID) {
		if (mybra.Ide === undefined) {alert ("Cliquez d'abord sur une branche."); return ko;}
		if (!Mono)           return MultiBRA (appID, tstID);         // Test all branches
		if (myjvm == allJVM) return MultiJVM (appID, tstID, mybra);  // Test all JVM
		return execUN (appID, tstID, mybra, myjvm);                  // Test branche/JVM courante
	}
	function MultiBRA (appID, tstID) {
		var dom = domlst[mybra.Dom];
		if (dom.Ide  === undefined) {alert ('Pas de domaine pour la branche ' + bra.Ide); return ko;}
		if (dom.nbBRA == 0)         {alert ('Pas de branche pour le domaine ' + dom.Ide); return ko;}
		if (dom.nbBRA == 1) return execUN (appID, tstID, mybra, myjvm);
		var i, bra, ret;
		for (i=0; i<dom.nbBRA; i++) {
			bra = bralst[dom.bralst[i]];
			ret = (myjvm == allJVM) ? MultiJVM (appID, tstID, bra) : execUN (appID, tstID, bra, myjvm);
			if (!ret) return ko;
		}
		return ok;
	}
	function MultiJVM (appID, tstID, bra) {
		var i, ret, dom = domlst[bra.Dom];
		if (bra.Ide  === undefined) {alert ("Cliquez d'abord sur une branche."); return ko;}
		if (dom.Ide  === undefined) {alert ('Pas de domaine pour la branche ' + bra.Ide); return ko;}
		if (dom.nbJVM == 0)         {alert ('Aucune JVM dans le domaine '     + dom.Ide); return ko;}
		for (i=1; i<=dom.nbJVM; i++) {
			ret = execUN (appID, tstID, bra, i);
			if (!ret) return ko;
		}
		return ok;
	}
	function execUN (appID, tstID, bra, jvm) {
		if (!checkNbExec()) return ko;                     // Trop de lancements déjà faits
		if (bra.Ide === null || bra.Ide == '') {alert ("Cliquez d'abord sur une branche."); return ko;}
		iExec += 1;
		var numExec = iExec;                               // Car besoin d'une variable locale
		if (Sdelai == 0) Sdelai = 10;                      // Il faut une valeur non nulle
		var Run = (modOuv == 'Frames') ? function() {openFrame  (numExec, appID, tstID, bra, jvm);}
		                               : function() {openOnglet (numExec, appID, tstID, bra, jvm);};
		exelst[numExec] = setTimeout (Run, Sdelai);
		// Ci-dessous : cas particulier dans lequel il ne faut jamais boucler
		if (appID == 'Jocker') {if (JockerReq().substring (0,7) == 'http://') return ko;}
		Sdelai += Qdelai;              // Le prochain sera exécuté 'Sdelai ms' après cette instruction
		return ok;
	}
	function calcURL (appID, tstID, bra, jvm) {
		if (appID != 'Jocker') {
			var ref = returnRefapp (bra, appID);           // Recherche Refapp du domaine/branche
			if (!ref) {
				alert ('Aucun Refapp "' + appID + '" pour la branche ' + bra.Ide);
				return;
			}
			var app = applst[appnum[appID]];               // Get objet Application du test
			var num = app.tstide[tstID];                   // Get numéro du test à exécuter
			var tst = app.tstlst[num];                     // Get objet Test
		}
		else {
			var tst = applst[0].tstlst[0];                 // Objet Test du Jocker
			tst.Req = JockerReq();                         // in pilotage.js
			if (tst.Req == '') {alert ('Pas de requete saisie.'); return false;}
			if (tst.Req.substring (0,7) == 'http://') return tst.Req;
			if (bra.Via != null) tst.Via = bra.Via;        // Descend le Via de la branche à ce test
			var ref = new Refapp ('Jocker');               // Pour faire comme les autres tests
		}
		var uri = calcURI_brajvm (bra,jvm,true); if (!uri) return ko;  // Uri de dom + bra + JVM
		    uri += ref.Uri;                                // Add Uri optionnelle de Refapp
		var via = '';                                      // Prise en compte de Via
		     if (tst.Via != '') {via = tst.Via;}
		else if (ref.Via != '') {via = ref.Via;}
		if (via != '') {if (parnum[via] != null) via = parlst[parnum[via]].Val;}
		var URL = via + 'http://' + uri + tst.Req;
		if (URL.substring (0,7) != 'http://') URL = 'http://' + URL;
		return URL;
	}
	function returnRefapp (bra, appID) {                   // Retourne un objet Refapp
		if (bra.nbREF > 0) {
			for (var i=0; i<bra.nbREF; i++) {              // Refapp spécifiques à la branche
				if (bra.reflst[i].Nom != appID) continue;
				return bra.reflst[i];
			}
		}
		var dom = domlst[bra.Dom];
		if (dom.nbREF > 0) {                               // Refapp au niveau du domaine
			for (var i=0; i<dom.nbREF; i++) {
				if (dom.reflst[i].Nom != appID) continue;
				return dom.reflst[i];
			}
		}
		return false;
	}
	function openOnglet (num, appID, tstID, bra, jvm) {
		var URL = calcURL     (appID, tstID, bra, jvm);
		if (!URL) return false;
		winlst[num] = window.open ('pendule.html?'+URL, 'quickverif_'+num);
		DoneTST (appID, tstID);
	}
	function openFrame (num, appID, tstID, bra, jvm) {
	var parent = document.getElementById ('parent_' + num);
	var frame  = document.getElementById ('frame_'  + num);
	var forme  = document.getElementById ('form_'   + num);
	var txt    = setitle (bra.Ide, tstID, jvm);
	var URL    = calcURL (appID, tstID, bra, jvm);
		if (!URL) return false;
	    parent.style.display = 'block';
		setLegend (forme, URL, txt);
		frame.onload = function() {DoneTST (appID, tstID);};
		setReload (frame, num, appID, tstID, URL);
		frame.src = 'about:blank';                         // Evite de faire apparaître ancien contenu
		frame.src = 'pendule.html?'+URL;
		if (num >= 3) gototopON();
		//scrollTo (0, num*420/2);
	}
	function setitle (braID, tstID, jvmID) {
		return (jvmID == 0) ? braID+'+'+tstID : braID+'+'+jvmID+'+'+tstID;
	}
	function setLegend (forme, URL, txt) {
	var txt1 =  txt.replace ('+', '&nbsp;-&nbsp;');
		txt1 = txt1.replace ('+', '&nbsp;-&nbsp;');
		  ID = forme.getAttribute('id').replace('form_','frame_');
	    leg  = forme.getElementsByTagName('legend')[0];
		leg.innerHTML    = '<font color="#FF6600">&nbsp;' + txt1 + '&nbsp;</font>';
		leg.style.cursor = 'pointer';
		leg.title        = URL;
		leg.onclick      = function(){window.open(URL);};
		return ok;
	}
	function setReload (frame, num, appID, tstID, URL) {
		var bouton = document.getElementById ('reload_'+num);
		bouton.onclick = function (event) {
			if (event.shiftKey) return copyURL2Jocker (URL);
			frame.src = URL;
		};
		bouton.style.display = 'block';
	}
	function copyURL2Jocker (URL) {
		if (!JOCKERopened) ouvreJOCKER();
		JOCKER.Jocker_TST.putText (URL);
		JOCKER.Jocker_TST.focusText();
		gototop();
	}
	function DoneTST (appli, ID) {if (appli != 'Jocker') TESTS.Done (appli, ID);}
	function checkNbExec() {
		if (iExec < maxLancements) return ok;
		if (modOuv == 'Frames') {
			alert ('Nombre maximum de lancements atteint (' + maxLancements + ').\nFaire une RAZ.');
			return ko;
		}
		iExec = 0;                               // Mode onglets ==> une simple RAZ suffit
		return ok
	}

/* ---------------------------------------------------------------------------------------------- */
