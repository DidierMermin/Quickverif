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
/* Ce fichier est dédié au chargement des fichiers XML et à leur parsing en JS */

/* ---------------------------------------------------------------------------------------------
	Parsing des fichiers XML avec log
	Chargement des tables de données : domaines, branches, applis, tests, etc.
--------------------------------------------------------------------------------------------- */

	var braxml, tstxml, defxml='Config.xml';
	var parlst = new Array();                    // Liste obj parametres   indexés  de 0 à N
	var parnum = new Array();                    // Liste num parametres   indexés  sur Ide
	var ferlst = new Array();                    // Liste obj fermes       indexées de 0 à N
	var fernum = new Array();                    // Liste num fermes       indexées sur Ide
	var domlst = new Array();                    // Liste obj domaines     indexés  de 0 à N
	var domnum = new Array();                    // Liste num domaines     indexés  sur Ide
	var bralst = new Array();                    // Liste obj branches     indexées de 0 à N
	var branum = new Array();                    // Liste num branches     indexées sur Ide
	var applst = new Array();                    // Liste obj applications indexées de 0 à N
	var appnum = new Array();                    // Liste num applications indexées sur Ide
	var id;                                      // Variable de travail passe partout

	var Parametre = function (Ide, Val) {
		this.Ide    = Ide;                       // Ex: Relais
		this.Val    = Val;                       // Ex: http://10.11.12.13/cgi-bin/wget.sh?
	}
	var Ferme = function (Ide) {
		this.Ide    = Ide;
	}
	var Domaine = function (Ide, Uri, Pref, Suff) {
		this.Ide    = Ide;
		this.Uri    = Uri;
		this.Via    = '';
		this.Pref   = Pref;
		this.Suff   = Suff;
		this.Titre  = '';
		this.bralst = new Array();               // Liste numeros de branches
		this.jvmlst = new Array();               // Liste numeros de JVM
		this.reflst = new Array();               // Objets Refapp communs aux bra du dom
		this.nbBRA  = 0;
		this.nbJVM  = 0;
		this.nbREF  = 0;
	}
	var Branche = function (Ide, Uri) {
		this.Ide    = Ide;
		this.Uri    = Uri;                                 // URI partielle
		this.Via    = '';                                  // Ex: ViaIndus (nom de parametre)
		this.Dom    = 0;                                   // Numero domaine dans domlst
		this.Titre  = '';
		this.reflst = new Array();                         // Objets Refapp propres a branche
		this.nbREF  = 0;
		this.nbTST  = 0;
	}
	var Refapp = function (Nom) {                          // Refapp = "lien" entre branches et applis
		this.Nom    = Nom;                                 // Par ex: mpmstore
		this.Uri    = '';                                  // Par ex: :8040 pour mpmstore
		this.Via    = '';                                  // Ex: http://10.10.10.43/cgi-bin/wget.sh?
	}
	var Application = function (Ide) {
		this.Ide    = Ide;
		this.tstlst = new Array();                         // Liste tests indexés de 0 à N
		this.tstide = new Array();                         // Liste tests indexés sur Ide du test
		this.nbTST  = 0;
	}
	var Test = function (Ide, Req) {                       // Peut être dans plusieurs applications
		this.Ide    = Ide;
		this.Req    = Req;
		this.Via    = '';                                  // Ex: http://10.10.10.43/indus/testxmlB.php?ip=
	}

	/* Cree application Jocker avec un test vide */

	applst[0]                  = new Application ('Jocker');
	appnum['Jocker']           = 0;
	applst[0].nbTST            = 1;
	applst[0].tstlst[0]        = new Test ('Jocker', '');
	applst[0].tstide['Jocker'] = 0

	/* Declenchement de theload() au load de la home page */

	var query_string, TSTdatas, BRAdatas;
	function log (texte) {FRAMELOG.addlog (texte);}
	function theload() {
		log ("Debut de theload().");
		/*
			Analyse URL de lancement
		*/
		query_string = location.search.substring(1).split("&");
		if (query_string.length > 0) {
			braxml = query_string[0];
			if (query_string.length == 1) tstxml = braxml;
			if (query_string.length == 2) tstxml = query_string[1];
		}
		if (braxml == '') braxml = defxml;
		if (tstxml == '') tstxml = defxml;
		/*
			Chargement javascript des données des parametres + fermes/domaines/branches/jvm/refapp
		*/
		if (!lance_parseFermes (braxml)) return false;
		/*
			Affichage HTML des branches
		*/
		var ficxsl = 'Branches_menu.xsl'
		log ('Start parsing de ' + braxml + ' en XSL via ' + ficxsl);
		log ("Pour l'affichage du menu des branches.");
		try {BRANCHES.addMenuBRA (braxml, ficxsl);}
		catch(e) {
			log ("Impossible d'afficher les branches en HTML via " + ficxsl);
			log ('Error Message : ' +  e.message);
			log ('Error Code    : ' + (e.number & 0xFFFF));
			log ('Error Name    : ' +  e.name);
			ouvreLOG();
			return false;
		}
		/*
			Affichage HTML des applications
		*/
		var ficxsl = 'Applis_menu.xsl'
		log ('Start parsing de ' + braxml + ' en XSL via ' + ficxsl);
		log ("Pour l'affichage du menu des applications.");
		try {APPLIS.addMenuAPP (braxml, ficxsl);}
		catch(e) {
			log ("Impossible d'afficher les applicaionts en HTML via " + ficxsl);
			log ('Error Message : ' +  e.message);
			log ('Error Code    : ' + (e.number & 0xFFFF));
			log ('Error Name    : ' +  e.name);
		}
		/*
			Chargement des applications/tests
		*/
		if (!lance_parseApplisTests (tstxml)) return false;
		/*
			Affichage HTML des tests (dans frame invisible)
		*/
		ficxsl = 'Tests_menu.xsl';
		log ('Start parsing de ' + tstxml + ' en XSL via ' + ficxsl);
		log ("Pour produire le tableau HTML des tests.");
		try {TESTS.addMenuTST (tstxml, ficxsl);}
		catch(e) {
			log ("Impossible d'afficher (mais invisibles) les tests en HTML via " + ficxsl);
			log ('Error Message : ' +  e.message);
			log ('Error Code    : ' + (e.number & 0xFFFF));
			log ('Error Name    : ' +  e.name);
			ouvreLOG();
			return false;
		}
		log ("--------------------------------------------------------------------------------------------------------------------------------------------------");
		log ('Traitements post parsing');
		/* Compte nombre de tests par application et met en titre l'attribut Via dans les tests */
		/* Note: actuellement, un seul test a un attribut Via : dealer locator XML B dans BS    */
		setTestsVia();
		/* Calcul de certaines donnees et mise a jour title HTML des branches */
		/* Cette fonction a besoin des résultats de setTestsVia()  */
		updateBRA();
		/* Fait apparaitre la frame des branches */
		ouvreBRA();
		/*
			Affichage (création) HTML des frames d'execution (mais invisibles)
			Note: le fichier braxml en entree ne sert qu'à respecter la syntaxe du call
		*/
		try {displayXML (braxml,'add_frames.xsl','frames_place');}
		catch(e) {
			log ("Impossible d'ajouter les iframes d'execution.");
			log ('Error Message : ' +  e.message);
			log ('Error Code    : ' + (e.number & 0xFFFF));
			log ('Error Name    : ' +  e.name);
			ouvreLOG();
			return false;
		}
		log ("Frames invisibles inserees dans la page.");
		log ("Fin de theload().");
		log ("--------------------------------------------------------------------------------------------------------------------------------------------------");
		/*
			Affichage du menu principal a l'emplacement (non ouvert et vide) des tests
		*/
		TESTS_CLOSED.atload();
		window.status = 'Quickverif OK';
	}

	/* ----- PARSING DES OBJETS Parametre/Ferme/Domaine/Branche/JVM/Refapp ----- */

	function lance_parseFermes (braxml) {
		log ("--------------------------------------------------------------------------------------------------------------------------------------------------");
		try {BRAdatas = loadXMLDoc (braxml, 'xml');}
		catch(e) {
			log ('Impossible de charger ' + braxml + ' pour le parsing.');
			log ('Error Message : ' +  e.message);
			log ('Error Code    : ' + (e.number & 0xFFFF));
			log ('Error Name    : ' +  e.name);
			ouvreLOG();
			return false;
		}
		log ('Start parsing des parametres/fermes/domaines/branches/jvm/refapp de ' + braxml);
		if (BRAdatas === null) {
			log ("Aucune donnee. Soit le fichier n'a pas ete trouve, soit il comporte une erreur xml." + braxml);
			ouvreLOG();
			return false;
		}
		try {	var ok = parseFermes (BRAdatas);
				if (! ok) {
					log ("Abandon du parsing de " + braxml);
					ouvreLOG();
					return false;
				}
			}
		catch(e) {
			log ('Impossible de parser ' + braxml + ' en javascript.');
			log ('Error Message : ' +  e.message);
			log ('Error Code    : ' + (e.number & 0xFFFF));
			log ('Error Name    : ' +  e.name);
			ouvreLOG();
			return false;
		}
		log ('Fin parsing des fermes de ' + braxml);
		return true;
	}
	function parseFermes (buffxml) {
		if (!parseParam (buffxml)) return false;           // Alimente parlst et parnum
		if (!parseFerme (buffxml)) return false;           // Alimente ferlst et fernum
		if (!parseDom   (buffxml)) return false;           // Alimente domlst et domnum
		if (!parseBra   (buffxml)) return false;           // Alimente bralst et branum
		if (!listeBraDom())        return false;           // Liste branches/domaine : indispensable
		if (!parseJVM   (buffxml)) return false;
		if (!parseRef   (buffxml)) return false;
		return true;
	}
	function parseParam (buffxml) {
		var par, Ide, i, old, lon = parlst.length, pos, per;
		var root  = buffxml.documentElement.nodeName;
		var liste = buffxml.getElementsByTagName ('Parametre');
		log (liste.length + ' objets Parametre.');
		if (liste.length == 0) {log ('Aucun objet Parametre.'); return true;}
		for (i=0; i<liste.length; i++) {
			  par = liste[i];
			  Ide = par.getAttribute ('Ide');
			  Val = par.getAttribute ('Val');
			log ('Parametre ' + (lon+i) + ': Ide="' + Ide + '" Val="' + Val + '"');
			per = par.parentNode.nodeName;
			if (per != root) {
				log ('Erreur: parametre inclus dans "' + per + '" et non pas dans "' + root + '".');
				return false;
			}
			if (Ide === null) {log ('Erreur: parametre sans Ide.');      return false;}
			if (Ide ==  '')   {log ('Erreur: parametre avec Ide vide.'); return false;}
			if (Ide.match (/^[A-Za-z0-9_.\/ ]+$/) != Ide) {
				log ('Erreur: parametre avec Ide (' + Ide + ') non alphanumerique.');
				log ('Caracteres possibles: AZaz09_./');
				return false;
			}
			if (Val === null) {log ('Erreur: parametre sans Val.');      return false;}
			if (Val ==  ''  ) {log ('Erreur: parametre avec Val vide.'); return false;}
			/* Dectection doublon */
			if (parnum[Ide] >= 0) {
				pos = parnum[Ide];
				parlst[pos].Val = Val;
				log (Ide + ' = parametre doublon ==> redefini: Val="' + Val + '"');
				continue
			}
			/* Ajout en table */
			pos = lon + i;
			parlst[pos] = new Parametre (Ide, Val);
			parnum[Ide] = pos;
		}
		log (parlst.length + ' parametre(s) defini(s).');
		log ("--------------------------------------------------------------------------------------------------------------------------------------------------");
		return true;
	}

	function parseFerme (buffxml) {
		var fer, Ide, i, lon = ferlst.length, pos, per;
		var root  = buffxml.documentElement.nodeName;
		var liste = buffxml.getElementsByTagName ('Ferme');
		log (liste.length + ' objets Ferme.');
		if (liste.length == 0) {
			log ('Erreur: aucun objet Ferme.');
			log ("Soit le fichier n'est pas le bon, soit il comporte une erreur de syntaxe XML.")
			return false;
		}
		for (i=0; i<liste.length; i++) {
			  fer = liste[i];
			  Ide = fer.getAttribute ('Ide');
			log ('Ferme ' + i + ': Ide="' + Ide + '"');
			per = fer.parentNode.nodeName;
			if (per != root) {
				log ('Erreur: ferme incluse dans "' + per + '" et non pas dans "' + root + '".');
				return false;
			}
			if (Ide === null) {log ('Erreur: ferme sans Ide.');      return false;}
			if (Ide ==  '')   {log ('Erreur: ferme avec Ide vide.'); return false;}
			if (Ide.match (/^[A-Za-z0-9_.\/ ]+$/) != Ide) {
				log ('Erreur: ferme avec Ide (' + Ide + ') non alphanumerique.');
				log ('Caracteres possibles: AZaz09_./');
				return false;
			}
			/* Dectection doublon */
			if (fernum[Ide] >= 0) {log ('***** WARNING ***** : ' + Ide + ' = ferme deja definie ==> ignoree.'); continue;}
			/* Ajout en table */
			pos = lon + i;
			ferlst[pos] = new Ferme (Ide);
			fernum[Ide] = pos;
		}
		log (ferlst.length + ' ferme(s) definie(s).');
		log ('--------------------------------------------------------------------------------------------------------------------------------------------------');
		return true;
	}
	function parseDom (buffxml) {
		var dom, Ide, Uri, Via, Pref, Suff, Titre, i, lon = domlst.length, pos;
		var liste = buffxml.getElementsByTagName ('Domaine');
		log (liste.length + ' objets Domaine.');
		if (liste.length == 0) {
			log ('Erreur: aucun objet Domaine');
			log ("Soit le fichier n'est pas le bon, soit il comporte une erreur de syntaxe XML.")
			return false;
		}
		for (i=0; i<liste.length; i++) {
			  dom = liste[i];
			  Ide = dom.getAttribute ('Ide');
			  Uri = dom.getAttribute ('Uri');
			  Via = dom.getAttribute ('Via');
			 Pref = dom.getAttribute ('Pref');
			 Suff = dom.getAttribute ('Suff');
			Titre = dom.getAttribute ('Titre');
			log ('Domaine ' + i
				+ ': Ide="' + Ide   + '"'
				+ ' Uri="'  + Uri   + '"'
				+ ' Pref="' + Pref  + '"'
				+ ' Suff="' + Suff  + '"'
				+ ' Titre="'+ Titre + '"'
				+ ' Via="'  + Via   + '"'
				);
			if (dom.parentNode.nodeName != 'Ferme') {log ('Erreur: domaine dans aucune ferme.'); return false;}
			if (Ide === null) {log ('Erreur: domaine sans Ide.');      return false;}
			if (Ide ==  '')   {log ('Erreur: domaine avec Ide vide.'); return false;}
			if (Ide.match (/^[A-Za-z0-9_.\/ ]+$/) != Ide) {
				log ('Erreur: domaine avec Ide (' + Ide + ') non alphanumerique.');
				log ('Caracteres possibles: AZaz09_./');
				return false;
			}
			if (Pref != null && Suff != null) {
				log ('Erreur: Pref et Suff ne doivent pas etre presents tous les deux.');
				return false;
			}
			/* Dectection doublon */
			if (domnum[Ide] >= 0          ) {log ('Erreur: domaine doublon.'); return false;}
			if (Pref != null && Pref == '') {log ('Erreur: Pref est vide.');   return false;}
			if (Suff != null && Suff == '') {log ('Erreur: Suff est vide.');   return false;}
			/* Ajout en table */
			pos = lon + i;
			domlst[pos] = new Domaine (Ide, Uri, Pref, Suff);
			domnum[Ide] = pos;
			if (Via != null && Via != '') domlst[pos].Via = Via;
			if (Titre === null) continue;
			domlst[pos].Titre = Titre;
		}
		log (domlst.length + ' domaines definis.');
		log ('--------------------------------------------------------------------------------------------------------------------------------------------------');
		return true;
	}
	function parseBra (buffxml) {
		var bra, per, dom, Ide, Uri, Via, i, j, p, txt, lon = bralst.length, pos;
		var liste = buffxml.getElementsByTagName ('Branche');
		log (liste.length + ' objets Branche.');
		if (liste.length == 0) {
			log ('Erreur: aucun objet Branche.');
			log ("Soit le fichier n'est pas le bon, soit il comporte une erreur de syntaxe XML.")
			return false;
		}
		for (i=0; i<liste.length; i++) {
			bra   = liste[i];
			Ide   = bra.getAttribute ('Ide');
			Uri   = bra.getAttribute ('Uri');
			Via   = bra.getAttribute ('Via');
			Titre = bra.getAttribute ('Titre');
			if (bra.parentNode.nodeName != 'Domaine') {
				log ('Branche ' + i
					+ ': Ide="' + Ide   + '"'
					+ ' Uri="'  + Uri   + '"'
					+ ' Titre="'+ Titre + '"'
					+ ' Via="'  + Via   + '"'
					);
				log ('Erreur: branche dans aucun domaine.');
				return false;
			}
			dom = bra.parentNode.getAttribute ('Ide');
			log ('Branche ' + i
				+ ': Dom="' + dom   + '"'
				+ ' Ide="'  + Ide   + '"'
				+ ' Uri="'  + Uri   + '"'
				+ ' Titre="'+ Titre + '"'
				+ ' Via="'  + Via   + '"');
			if (Ide === null) {log ('Erreur: branche sans Ide.');      return false;}
			if (Ide ==  '')   {log ('Erreur: branche avec Ide vide.'); return false;}
			if (Ide.match (/^[A-Za-z0-9_.\/ ]+$/) != Ide) {
				log ('Erreur: branche avec Ide (' + Ide + ') non alphanumerique.');
				log ('Caracteres possibles: AZaz09_./');
				return false;
			}
			if (isNaN (domnum[dom])) {
				log ("Erreur: le domaine de cette branche n'a pas ete charge ==> branche non chargee.");
				continue;
			}
			/* Dectection doublon */
			if (branum[Ide] >= 0) {log ('Erreur: branche doublon.');       return false;}
			if (Uri === null    ) {log ('Erreur: branche sans Uri.');      return false;}
			if (Uri ==  ''      ) {log ('Erreur: branche avec Uri vide.'); return false;}
			/* Ajout en table */
			pos = lon + i;
			bralst[pos] = new Branche (Ide, Uri);
			branum[Ide] = pos;
			dom = domnum[dom];                   // dom passe de l'Ide au numéro
			bralst[pos].Dom = dom;
			if (Via != null && Via != '') {bralst[pos].Via = Via;}
			else {
				// Descend le Via du Domaine à cette branche
				if (domlst[dom].Via != '') {bralst[pos].Via = domlst[dom].Via;}
			}
			if (Titre === null) {
				if (domlst[dom].Titre != '') bralst[pos].Titre = domlst[dom].Titre;
				continue;
			}
			if (Titre != '') bralst[pos].Titre = Titre;
		}
		log (bralst.length + ' branches definies.');
		log ('--------------------------------------------------------------------------------------------------------------------------------------------------');
		return true;
	}
	function listeBraDom() {
		log ('Calcul listes des branches par domaine');
		for (i=0; i<domlst.length; i++) {domlst[i].bralst = new Array();}        // RAZ
		for (i=0; i<bralst.length; i++) {
			dom = bralst[i].Dom;
			lon = domlst[dom].bralst.length;
			domlst[dom].bralst[lon] = i;                   // Ajout à la liste des branches du domaine
		}
		log ('Calcul nombre de branches par domaine');
		for (i=0; i<domlst.length; i++) {
			domlst[i].nbBRA = domlst[i].bralst.length;
			txt = '';
			if (domlst[i].nbBRA == 0) {
				log ('Erreur: domaine ' + domlst[i].Ide + ' sans branche.');
				return false;
			}
			for (j=0; j<domlst[i].nbBRA; j++) {
				p = domlst[i].bralst[j];
				txt = txt + bralst[p].Ide + ' ';
			}
			log (domlst[i].Ide + ': ' + domlst[i].nbBRA + ' - Ide = ' + txt);
		}
		log ('--------------------------------------------------------------------------------------------------------------------------------------------------');
		return true;
	}
	function parseJVM (buffxml) {
		var jvm, per, dom, Uri, i, j, p, txt;
		var liste = buffxml.getElementsByTagName ('JVM');
		log (liste.length + ' objets JVM.');
		for (i=0; i<liste.length; i++) {
			jvm = liste[i];
			Uri = jvm.getAttribute ('Uri');
			if (jvm.parentNode.nodeName != 'Domaine') {
				log ('JVM ' + i + ': Uri="' + Uri + '"');
				log ('Erreur: JVM dans aucun domaine.');
				return false;
			}
			dom = jvm.parentNode.getAttribute ('Ide');
			log ('JVM ' + i + ': Dom="' + dom + '"' + ' Uri="'  + Uri + '"');
			if (Uri === null) {log ('Erreur: JVM sans Uri.');      return false;}
			if (Uri ==  '')   {log ('Erreur: JVM avec Uri vide.'); return false;}
			if (isNaN (domnum[dom])) {
				log ("Erreur: le domaine de cette JVM n'a pas ete charge ==> JVM non chargee.");
				continue;
			}
			/* Ajoute la JVM à son domaine */
			j = domnum[dom];
			p = domlst[j].jvmlst.length;
			if (p >= 4) {log ('Deja 4 JVM sur ce domaine ==> JVM ignoree.'); continue;}
			domlst[j].jvmlst[p] = Uri;
		}
		log ('--------------------------------------------------------------------------------------------------------------------------------------------------');
		log ('Calcul nombre de JVM par domaine');
		for (i=0; i<domlst.length; i++) {
			domlst[i].nbJVM = domlst[i].jvmlst.length;
			if (domlst[i].nbJVM > 0) {
				txt = '';
				for (j=0; j<domlst[i].nbJVM; j++) {txt = txt + domlst[i].jvmlst[j] + ' ';}
				log (domlst[i].Ide + ': ' + domlst[i].nbJVM + ' - Uri = ' + txt);
			}
		}
		log ('--------------------------------------------------------------------------------------------------------------------------------------------------');
		return true;
	}
	function parseRef (buffxml) {
		var ref, per, Nom, Uri, Via, i, j, p, nb, bra, dom, txt;
		var liste = buffxml.getElementsByTagName ('Refapp');
		log (liste.length + ' objets Refapp');
		if (liste.length == 0) {
			log ('Erreur: aucun objet Refapp.');
			log ("Soit le fichier n'est pas le bon, soit il comporte une erreur de syntaxe XML.")
			return false;
		}
		for (i=0; i<liste.length; i++) {
			ref = liste[i];
			Nom = ref.getAttribute ('Nom');
			Uri = ref.getAttribute ('Uri');
			Via = ref.getAttribute ('Via');
			per = ref.parentNode.nodeName;
			 id = ref.parentNode.getAttribute ('Ide');
			log ('Refapp '  + i
				+ ': Nom="' + Nom + '"'
				+ '  Uri="' + Uri + '"'
				+ '  Via="' + Via + '"'
				+ ' - parent="' + per + ' ' + id + '"');
			if (per != 'Domaine' && per != 'Branche' && per != 'JVM') {
				log ("Erreur: ce Refapp n'appartient pas a un Domaine, une Branche ou une JVM.");
				return false;
			}
			if (Nom === null) {log ('Erreur: Refapp sans Nom.');      return false;}
			if (Nom ==  '')   {log ('Erreur: Refapp avec Nom vide.'); return false;}
			if (Nom.match (/^[A-Za-z0-9_.\/ ]+$/) != Nom) {
				log ('Erreur: refapp avec Nom (' + Nom + ') non alphanumerique.');
				log ('Caracteres possibles: AZaz09_./');
				return false;
			}
			/* Ajoute ce Refapp à son Domaine */
			if (per == 'Domaine') {
				if (isNaN (domnum[id])) {
					log ('***** WARNING ***** : ' + "le domaine de ce Refapp n'a pas ete charge ==> Refapp non charge.");
					continue;
				}
				dom = domlst[domnum[id]];
				p   = dom.reflst.length;
				dom.reflst[p] = new Refapp (Nom);
				if (Uri != null) dom.reflst[p].Uri = Uri;
				if (Via != null && Via != '') {dom.reflst[p].Via = Via;}
				else {
					// Descend le Via du Domaine à ce Refapp
					if (dom.Via != '') dom.reflst[p].Via = dom.Via;
				}
			}
			/* Ajoute ce Refapp à sa Branche */
			if (per == 'Branche') {
				if (isNaN (branum[id])) {
					log ('***** WARNING ***** : ' + "la branche de ce Refapp n'a pas ete chargee ==> Refapp non charge.");
					continue;
				}
				bra = bralst[branum[id]];
				p   = bra.reflst.length;
				bra.reflst[p] = new Refapp (Nom);
				if (Uri != null) bra.reflst[p].Uri = Uri;
				if (Via != null && Via != '') {bra.reflst[p].Via = Via;}
				else {
					// Descend le Via de la branche à ce Refapp
					if (bra.Via != '') bra.reflst[p].Via = bra.Via;
				}
			}
		}
		log ('--------------------------------------------------------------------------------------------------------------------------------------------------');
		log ('Calcul nombre de Refapp au niveau des domaines');
		nb = 0;
		for (i=0; i<domlst.length; i++) {
			dom = domlst[i];
			dom.nbREF = dom.reflst.length;
			if (dom.nbREF > 0) {
				txt = '';
				for (j=0; j<dom.nbREF; j++) {txt += dom.reflst[j].Nom + ' ';}
				log (dom.Ide + ': ' + dom.nbREF + ' - Noms = ' + txt);
				nb += 1;
			}
		}
		if (nb == 0) log ('Resultat: aucun Refapp au niveau des domaines.');
		log ('--------------------------------------------------------------------------------------------------------------------------------------------------');
		log ('Calcul nombre de Refapp au niveau des branches');
		nb = 0;
		for (i=0; i<bralst.length; i++) {
			bra = bralst[i];
			bra.nbREF = bra.reflst.length;
			if (bra.nbREF > 0) {
				txt = '';
				for (j=0; j<bra.nbREF; j++) {txt += bra.reflst[j].Nom + ' ';}
				log (bra.Ide + ': ' + bra.nbREF + ' - Noms = ' + txt);
				nb += 1;
				continue;
			}
			if (domlst[bra.Dom].nbREF == 0) log ('***** WARNING ***** : Branche ' + bra.Ide + ': aucune appli chargee.');
		}
		if (nb == 0) log ('Resultat: aucun Refapp au niveau des branches.');
		log ('--------------------------------------------------------------------------------------------------------------------------------------------------');
		return true;
	}
	function updateBRA() {
		log ('Calcul de certaines donnees et mise a jour title HTML des branches');
		var i, j, k, domcpt, bracpt, domapp, braapp, ibra, bra, dom, app, uri;
		for (i=0; i<domlst.length; i++) {
			dom = domlst[i];
			if (dom.nbBRA == 0) continue;
			/* 1) Tests positionnes au niveau du domaine via Refapp */
			domcpt = 0;
			domapp = '';
			if (dom.nbREF > 0) {
				for (k=0; k<dom.nbREF; k++) {
					app = dom.reflst[k].Nom;
					uri = dom.reflst[k].Uri;
					if (appnum[app] === null)      continue;
					if (appnum[app] === undefined) continue;
					domcpt += applst[appnum[app]].nbTST;             // Compte les tests
					domapp += '\n' + app;                            // Liste des applis
					if (uri != '') domapp += ' (' + uri + ')';
				}
			}
			/* 2)  Tests positionnes au niveau des branches via leurs Refapp */
			/* 2a) Calcul pour la 1ere branche */
			bracpt = 0;
			braapp = '';
			ibra = dom.bralst[0];
			 bra = bralst[ibra];
			if (bra.nbREF > 0) {
				for (k=0; k<bra.nbREF; k++) {
					app = bra.reflst[k].Nom;
					uri = bra.reflst[k].Uri;
					if (appnum[app] === null)      continue;
					if (appnum[app] === undefined) continue;
					bracpt += applst[appnum[app]].nbTST;
					braapp += '\n' + app;
					if (uri != '') braapp += ' (' + uri + ')';
				}
			}
			/* 2b)  Calcul pour les autres branches */
			/* 2ba) Toutes les branches sont identiques ==> mise a jour seulement */
			if (dom.nbJVM > 0) {
				for (j=0; j<dom.nbBRA; j++) {
					ibra = dom.bralst[j];
					majUneBranche (ibra, domcpt, bracpt, domapp, braapp);
				}
				continue;
			}
			/* 2bb)  Les branches peuvent etre differentes */
			/* 2bba) Mise a jour de la 1ere branche */
			majUneBranche (ibra, domcpt, bracpt, domapp, braapp);
			/* 2bbb) Calcul et mise a jour des autres branches */
			for (j=1; j<dom.nbBRA; j++) {
				bracpt = 0;
				braapp = '';
				ibra = dom.bralst[j];
				 bra = bralst[ibra];
				if (bra.nbREF > 0) {
					for (k=0; k<bra.nbREF; k++) {
						app = bra.reflst[k].Nom;
						uri = bra.reflst[k].Uri;
						if (appnum[app] === null)      continue;
						if (appnum[app] === undefined) continue;
						bracpt += applst[appnum[app]].nbTST;
						braapp += '\n' + app;
						if (uri != '') braapp += ' (' + uri + ')';
					}
				}
				majUneBranche (ibra, domcpt, bracpt, domapp, braapp);
			}
		}
		log ('--------------------------------------------------------------------------------------------------------------------------------------------------');
	}
	function majUneBranche (ibra, domcpt, bracpt, domapp, braapp) {
		var bra    = bralst[ibra];
		var totaux = domcpt + bracpt;
		var totapp = domapp + braapp;
		var titre  = '';
		bra.nbTST  = totaux;
		if (bra.Titre === null || bra.Titre == '') titre = 'Sans titre'; else titre = bra.Titre;
		if (totaux == 0) {
			titre += '\nAucun test.';
			BRANCHES.setTitle (bra.Ide, titre);
			log (bra.Ide + ': aucun test');
			return;
		}
		totapp += '\n' + totaux;
		if (totaux  >  1 ) totapp += ' tests';
		if (totaux  == 1 ) totapp += ' test';
		if (bra.Via != '') totapp += '\nVia ' + bra.Via;
		titre += totapp;
		BRANCHES.setTitle (bra.Ide, titre);
		log (bra.Ide + ' applis: '+ totapp);
	}

	/* ----- PARSING DES OBJETS Parametre/Application/Test ----- */

	function lance_parseApplisTests (tstxml) {
		log ("--------------------------------------------------------------------------------------------------------------------------------------------------");
		try {TSTdatas = loadXMLDoc (tstxml, 'xml');}
		catch(e) {
			log ('Impossible de charger ' + tstxml + ' pour le parsing.');
			log ('Error Message : ' +  e.message);
			log ('Error Code    : ' + (e.number & 0xFFFF));
			log ('Error Name    : ' +  e.name);
			ouvreLOG();
			return false;
		}
		log ('Start parsing des applications/tests de ' + tstxml);
		if (TSTdatas === null) {
			log ("Aucune donnee. Soit le fichier n'a pas ete trouve, soit il comporte une erreur xml." + braxml);
			ouvreLOG();
			return false;
		}
		try {	var ok = parseApplisTests (TSTdatas);
				if (! ok) {
					log ("Abandon du parsing de " + tstxml);
					ouvreLOG();
					return false;
				}
			}
		catch(e) {
			log ('Impossible de parser ' + tstxml);
			log ('Error Message : ' +  e.message);
			log ('Error Code    : ' + (e.number & 0xFFFF));
			log ('Error Name    : ' +  e.name);
			ouvreLOG();
			return false;
		}
		log ('Fin parsing des applications/tests de ' + tstxml);
		return true;
	}
	function parseApplisTests (buffxml) {
		if (!parseParam (buffxml)) return false;         // Alimente parlst et parnum (2nd time)
		log ('Nombre total de parametres : ' + parlst.length);
		if (!parseApp   (buffxml)) return false;         // Alimente applst et appnum
		if (!parseTst   (buffxml)) return false;
		return true;
	}
	function parseApp (buffxml) {
		var app, per, Ide, i, lon = applst.length, pos;
		var root = buffxml.documentElement.nodeName;
		var liste = buffxml.getElementsByTagName ('Application');
		log (liste.length + ' objets Application.');
		if (liste.length == 0) {
			log ('Erreur: aucun objet Application.');
			log ("Soit le fichier n'est pas le bon, soit il comporte une erreur de syntaxe XML.")
			return false;
		}
		log ('Application 0: Ide="Jocker"');
		for (i=0; i<liste.length; i++) {
			app = liste[i];
			Ide = app.getAttribute ('Ide');
			log ('Application ' + (i+1) + ': Ide="' + Ide + '"');
			per = app.parentNode.nodeName;
			if (per != root) {
				log ('Erreur: application incluse dans "' + per + '" et non pas dans "' + root + '".');
				return false;
			}
			if (Ide === null) {log ('Erreur: application sans Ide.');      return false;}
			if (Ide ==  '')   {log ('Erreur: application avec Ide vide.'); return false;}
			if (Ide.match (/^[A-Za-z0-9_.\/ ]+$/) != Ide) {
				log ('Erreur: application avec Ide (' + Ide + ') non alphanumerique.');
				log ('Caracteres possibles: AZaz09_./');
				return false;
			}
			/* Dectection doublon */
			if (appnum[Ide] >= 0) {log ('***** WARNING ***** : application deja chargee.'); continue;}
			/* Ajout en table */
			pos = lon + i;
			applst[pos] = new Application (Ide);
			appnum[Ide] = pos;
		}
		log ('--------------------------------------------------------------------------------------------------------------------------------------------------');
		return true;
	}
	function parseTst (buffxml) {
		var tst, per, Ide, Req, Via, i, k, l, p, app, APP;
		var liste = buffxml.getElementsByTagName ('Test');
		log (liste.length + ' objets Test');
		if (liste.length == 0) {
			log ('Erreur: aucun objet Test.');
			log ("Soit le fichier n'est pas le bon, soit il comporte une erreur de syntaxe XML.")
			return false;
		}
		for (i=0; i<liste.length; i++) {
			tst = liste[i];
			Ide = tst.getAttribute ('Ide');
			Req = tst.getAttribute ('Requete');
			Via = tst.getAttribute ('Via');
			per = tst.parentNode.nodeName;
			APP = tst.parentNode.getAttribute ('Ide');
			if (per != 'Application') {
				log ('Test ' + i + ': Ide="' + Ide + '" parent="' + APP + '"');
				log ('Erreur: test inclus dans "' + per + '" et non pas dans un objet Application.');
				return false;
			}
			if (Ide === null) {
				log ('Test ' + i + ': Ide="' + Ide + '" parent="' + APP + '"');
				log ('Erreur: test sans Ide.');
				return false;
			}
			if (Ide == '') {
				log ('Test ' + i + ': Ide="' + Ide + '" parent="' + APP + '"');
				log ('Erreur: test avec Ide vide.');
				return false;
			}
			p = appnum[APP];
			app = applst[p];
			if (app.tstide[Ide] >= 0) {                    // Test déjà dans la table de l'appli
				k = app.tstide[Ide];                       // Numero du test relatif a l'appli
				log ('***** WARNING ***** : Test ' + i + ' doublon: Ide="' + Ide + '" appli="' + app + '" (= test #' + k + ' in appli)');
				continue;
			}
			if (Req === null) {
				if (Via === null) {log ('Erreur: test sans requete et sans attribut Via.'); return false;}
				if (Via ==  ''  ) {log ('Erreur: test sans requete et attribut Via vide.'); return false;}
			}
			if (Req == '') {
				if (Via === null) {log ('Erreur: test avec requete vide et sans attribut Via.'); return false;}
				if (Via ==  ''  ) {log ('Erreur: test avec requete vide et attribut Via vide.'); return false;}
			}
			/* On met le test dans la table de l'appli */
			l = applst[p].tstlst.length;
			app.tstlst[l] = new Test (Ide, Req);
			app.tstide[Ide] = l;
			if (Via === null) {log ('Test '+i+': Ide="'+Ide+'" parent="'+APP+'"'); continue}
			if (Via  == ''  ) {log ('Test '+i+': Ide="'+Ide+'" parent="'+APP+'"'); continue}
			app.tstlst[l].Via = Via;
			log ('Test '+i+': Ide="'+Ide+'" parent="'+APP+'" Via="'+Via+'"');
		}
		log ('--------------------------------------------------------------------------------------------------------------------------------------------------');
		return true;
	}
	function setTestsVia() {
		log ('Parcours des tests pour maj nombre de tests par application et pour attribut Via dans les titres.');
		var i, j, app, Via;
		for (i=0; i<applst.length; i++) {
			app = applst[i];
			app.nbTST = app.tstlst.length;
			if (app.nbTST > 1) log (app.Ide + ': ' + app.nbTST + ' tests.');
			if (app.nbTST < 2) log (app.Ide + ': ' + app.nbTST + ' test.' );
			for (j=0; j<app.nbTST; j++) {
				Via = app.tstlst[j].Via;
				if (Via != '') {
					TESTS.addToTitle (app.Ide+'_'+app.tstlst[j].Ide, '\nVia '+Via);
					log (app.Ide+': test '+app.tstlst[j].Ide+ ': Via="'+Via+'"');
				}
			}
		}
		log ('--------------------------------------------------------------------------------------------------------------------------------------------------');
	}

/* ---------------------------------------------------------------------------------------------- */
