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
/*
	Gestion des menus commandes branches/JVM/tests et de l'affichage (cacher/montrer)
/
/*
	A) Les variables globales
*/
	var maxJVM       = 4;                                  // Nb max JVM in JVM_menu.html
	var allJVM       = '-1';                               // Valeur option "toutes JVM" (must be <0)
	var Theme        = 1;                                  // Numero du jeu de couleurs (1 ou 2)
	var LOGopened    = false;                              // Frame LOG
	var BRAopened    = true;                               // Frame BRANCHES
	var APPopened    = false;                              // Frame APPLIS
	var JVMopened    = false;                              // Frame JVM
	var TESTSopened  = false;                              // Frame TESTS
	var JOCKERopened = false;                              // Frame JOCKER
	var Fermes       = true;                               // Classement par fermes, sinon par applis
	var Mono         = true;                               // true/false (false si Multi)
	var modOuv       = 'Frames';                           // Frames/Onglets
	var myjvm        = 0;                                  // Numero JVM active ou valeur de allJVM
	var mybra        = new Branche;                        // Objet Branche de la branche active
	var mydom        = new Domaine;                        // Objet Domaine de la branche active
	var myapp        = new Application;                    // Objet Application sélectionnée
/*
	B) Cacher/montrer les frames
*/
	function ouvreLOG() {
		LOGopened = true;
		BRAopened = false;
		APPopened = false;
		document.getElementById('FRAMELOG').style.display = 'block';
		document.getElementById('BRANCHES').style.display = 'none';
		document.getElementById('APPLIS'  ).style.display = 'none';
	}
	function ouvreBRA() {
		Fermes    = true;
		LOGopened = false;
		BRAopened = true;
		APPopened = false;
		document.getElementById('FRAMELOG').style.display = 'none';
		document.getElementById('BRANCHES').style.display = 'block';
		document.getElementById('APPLIS'  ).style.display = 'none';
	}
	function ouvreAPP() {
		Fermes    = false;
		LOGopened = false;
		BRAopened = false;
		APPopened = true;
		document.getElementById('FRAMELOG').style.display = 'none';
		document.getElementById('BRANCHES').style.display = 'none';
		document.getElementById('APPLIS'  ).style.display = 'block';
	}
	function fermeJVM() {
		JVMopened = false; myjvm = 0;
		document.getElementById('td_JVM_CLOSED').style.display = 'block';
		document.getElementById('td_JVM'       ).style.display = 'none';
		focusCDE();
	}
	function ouvreJVM() {
		JVMopened = true;
		document.getElementById('td_JVM_CLOSED').style.display = 'none';
		document.getElementById('td_JVM'       ).style.display = 'block';
	}
	function fermeTESTS() {
		TESTSopened = false;
		document.getElementById ('td_TESTS_CLOSED').style.display = 'block';
		document.getElementById ('td_TESTS'       ).style.display = 'none';
		focusCDE();
	}
	function ouvreTESTS() {
		TESTSopened = true;
		document.getElementById('td_TESTS_CLOSED').style.display = 'none';
		document.getElementById('td_TESTS'       ).style.display = 'block';
	}
	function ouvreJOCKER() {
		if (JOCKERopened) {fermeJOCKER(); return;}
		JOCKERopened = true;
		document.getElementById ('div_JOCKER').style.display = 'block';
		JOCKER.Jocker_TST.focusText();
	}
	function fermeJOCKER() {
		JOCKERopened = false;
		document.getElementById ('div_JOCKER').style.display = 'none';
		focusCDE();
	}
/*
	C) Menu frame CDE = actions diverses et options
*/
	function RAZ() {
		var i, j, app, tst, parent, frame;
		Interrupt();
		for (i=1; i<=iExec; i++) {
			parent = document.getElementById ('parent_' + i);
			frame  = document.getElementById ('frame_'  + i);
			frame.src = 'about:blank';
			frame.onload = '';
			parent.style.display = 'none';
			if (winlst[i]) winlst[i].close();
		}
		iExec = 0;
		for (i=1; i<applst.length; i++) {                  // On demarre à 1 car appli 0 = Jocker
			app = applst[i];
			for (j=0; j<app.tstlst.length; j++) {
				tst = app.tstlst[j];
				TESTS.Reset (app.Ide, tst.Ide);
			}
		}
		gototopOFF();
		exelst = new Array();                              // in execution.js
		focusCDE();
	}
	function Tous() {
		Sdelai = 0;                                        // in execution.js
		MultiTST();                                        // in execution.js
	}
	function MonoMulti (Mode) {
		if (Mode == 'Mono' || Mode == 'Reset') {
			CDE.Reset ('Multi');
			CDE.SetON ('Mono');
			Mono = true;
		}
		if (Mode == 'Multi') {
			CDE.Reset ('Mono' );
			CDE.SetON ('Multi');
			Mono = false;
		}
		setEntete();
	}
	function Ouverture (Mode) {
		if (Mode == 'Frames') {
			CDE.SetON ('Frames' );
			CDE.Reset ('Onglets');
			modOuv = 'Frames';
		}
		if (Mode == 'Onglets') {
			CDE.Reset ('Frames' );
			CDE.SetON ('Onglets');
			modOuv = 'Onglets';
		}
		RAZ();                                   // Pour éviter problème de comptage des exécutions
	}
	function Home() {
		RAZ();
		if (LOGopened) ouvreBRA();
		(BRAopened) ? ResetBRA() : ResetAPP();
		fermeJVM();
		fermeTESTS();
		fermeJOCKER();
		Ouverture ('Frames');
		MonoMulti ('Reset' );
	}
/*
	D) Menu des JVM
*/
	function ResetJVM() {                                  // Initialise état du menu des JVM
		myjvm = 1;                                         // Select JVM 1
		JVM.SetON ('1');
		for (var i=2; i<=maxJVM; i++) {JVM.Reset (i+'');}  // Deselect  autres JVM
		JVM.Reset (allJVM);                                // Deselect "Toutes JVM"
		if (mydom.nbJVM < 2) JVM.Desactive (allJVM);       // Inhibe option "Toutes JVM"
		for (var i=2; i<=maxJVM; i++) {                    // Inhibe JVM absentes du domaine/branche
			if (mydom.nbJVM < i) JVM.Desactive (i+'');
		}
		if (mydom.nbJVM >  0) ouvreJVM();                  // Affiche le menu des JVM
		if (mydom.nbJVM == 0) fermeJVM();                  // Masque  le menu des JVM
	}
	function ActiveJVM (ID) {
		if (myjvm != 0) {
			if (myjvm == parseInt(ID)) return;             // JVM déjà active
			JVM.Reset (myjvm+'');                          // Deselect JVM actuelle
		}
		JVM.SetON (ID);                                    // Active   la JVM voulue
		myjvm = parseInt (ID);                             // Keep numero JVM active
		setEntete();
	}
/*
	E) Menu des branches
*/
	function ActiveBRA (IDBRA) {
		if (branum[IDBRA] >= 0) {
			if (mybra.Ide != undefined) {
				if (mybra.Ide == IDBRA) return;
				BRANCHES.Reset (mybra.Ide);
			}
			BRANCHES.SetON (IDBRA);
			mybra = bralst[branum[IDBRA]];
			mydom = domlst[mybra.Dom];
			ResetJVM();
			DisplayTEST();
			MonoMulti ('Reset');
			return true;
		}
		alert ('Branche inconnue: ' + IDBRA); return false;
	}
	function ResetBRA() {
		if (mybra.Ide != undefined) BRANCHES.Reset (mybra.Ide);
		mybra = new Branche;
		mydom = new Domaine;
		myjvm = 0;
	}
/*
	F) Menu des applications
*/
	function altBraApp() {
		Home();
		(BRAopened) ? ouvreAPP() : ouvreBRA();
	}
	function ActiveAPP (IDBRA, IDAPP) {
		if (appnum[IDAPP] >= 0) {
			if (branum[IDBRA] >= 0) {
				if (mybra.Ide != undefined && myapp.Ide != undefined) {
					if (mybra.Ide == IDBRA && myapp.Ide == IDAPP) return;
					APPLIS.Reset (mybra.Ide, myapp.Ide);
				}
				APPLIS.SetON (IDBRA, IDAPP);
				myapp = applst[appnum[IDAPP]];
				mybra = bralst[branum[IDBRA]];
				mydom = domlst[mybra.Dom];
				ResetJVM();
				DisplayTESTApp (IDAPP);
				MonoMulti ('Reset');
				return true;
			}
			alert ('Branche inconnue: ' + IDBRA); return false;
		}
		alert ('Application inconnue: ' + IDAPP); return false;
	}
	function ResetAPP() {
		if (mybra.Ide != undefined && myapp.Ide != undefined) APPLIS.Reset (mybra.Ide, myapp.Ide);
		myapp = new Application;
		mybra = new Branche;
		mydom = new Domaine;
		myjvm = 0;
	}
/*
	G) Menus des tests (1 menu par branche)
*/
	function runTest (_event_, appID, tstID) {
		if (_event_.shiftKey) return copy2Jocker (appID, tstID);
		if (!Mono && mydom.nbBRA > 1) RAZ();
		Sdelai = 0;                                        // in execution.js
		exeTest (appID, tstID);                            // in execution.js
	}
	function DisplayTEST() {
		var i;
		if (!TESTSopened) ouvreTESTS();
		TESTS.cacheTout();
		if (mydom.nbREF > 0) {for (i=0; i<mydom.nbREF; i++) TESTS.showTest (mydom.reflst[i].Nom);}
		if (mybra.nbREF > 0) {for (i=0; i<mybra.nbREF; i++) TESTS.showTest (mybra.reflst[i].Nom);}
		setEntete();
	}
	function DisplayTESTApp (IDAPP) {
		var i;
		if (!TESTSopened) ouvreTESTS();
		TESTS.cacheTout();
		if (mydom.nbREF > 0) {
			for (i=0; i<mydom.nbREF; i++) {
				if (mydom.reflst[i].Nom != IDAPP) continue;
				TESTS.showTest (IDAPP);
				break;
			}
		}
		if (mybra.nbREF > 0) {
			for (i=0; i<mybra.nbREF; i++) {
				if (mybra.reflst[i].Nom != IDAPP) continue;
				TESTS.showTest (IDAPP);
				break;
			}
		}
		setEntete();
	}
	function setEntete() {
		if (mybra.Ide === undefined) return;
		var txt;
		if (Mono || mydom.nbBRA == 1) {
			var URI = calcURI_brajvm (mybra, myjvm, true);
			if (!URI) {} else {txt = mybra.Ide + ' - ' + URI;}
			if (mydom.nbBRA == 1) txt += ' - une seule branche';
		}
		else {
			txt = mydom.Ide;
			if (mydom.nbBRA > 1)              txt += ' - toutes branches';
			if (myjvm > 0 && myjvm <= maxJVM) txt += ' - jvm' + myjvm;
			if (myjvm              == allJVM) txt += ' - toutes jvm';
		}
		TESTS.setEntete (txt);
	}
/*
	H) Jocker
*/
	function JockerReq() {return JOCKER.Jocker_TST.JockerReq();}
	function copy2Jocker (appID, tstID) {
		if (!JOCKERopened) ouvreJOCKER();
		var URL = calcURL (appID, tstID, mybra, myjvm);
		if (!URL) return false;
		JOCKER.Jocker_TST.putText (URL);
	}
/*
	I) Divers
*/
	function initALL() {
		         ResetBRA();
		BRANCHES.ResetALL();
		  APPLIS.ResetALL();
		     CDE.ResetALL();
			 JVM.ResetALL();
		JOCKER.Jocker_CDE.ResetALL();
		Ouverture ('Frames');
		MonoMulti ('Mono');
		if (parnum['Titre'] != null) {
			var titre = parlst[parnum['Titre']].Val;
			JVM_CLOSED.setTitre (titre);
			document.title = titre;
		}
	}
	function Ouvre() {                                     // Ouvre nouvelle instance
		open (location);
	}
	function Interrupt() {
		if (exelst.length > 0) {
			for (var i=1; i<=exelst.length; i++) {
				clearTimeout (exelst[i]);
			}
			exelst = new Array();
		}
	}
	function changeTheme() {
		if (Theme == 1) {Theme = 2;} else {Theme = 1;}
		TESTS_CLOSED.ResetALL();
		  JVM_CLOSED.ResetALL();
		initALL();
	}
	function focusCDE() {     // Focus sur iframe CDE sinon les raccourcis ne marchent pas toujours
		window.document.getElementById('CDE').focus();
	}
	function keyDOWN (myEvent, ctrlC) {
		var KeyCode = myEvent.keyCode;
		var CtrlKey = myEvent.ctrlKey;
		if (!CtrlKey && KeyCode == 27)  {RAZ();         return;} // ECHAP
		if ( CtrlKey && KeyCode == 161) {altBraApp();   return;} // Ctrl-!
		if ( CtrlKey && KeyCode == 77)  {ouvreJOCKER(); return;} // Ctrl-M
		if ( CtrlKey && KeyCode == 81)  {Ouvre();       return;} // Ctrl-Q
		// Ci-dessous, le flag ctrlC est mis à false dans Jocker_test.html et FrameLOG.html
		if ( CtrlKey && KeyCode == 67 && ctrlC) {Interrupt(); focusCDE(); return;}
	}

/* ---------------------------------------------------------------------------------------------- */
