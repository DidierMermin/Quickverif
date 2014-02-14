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
// Petites fonctions diverses

/* 1) Fonction pour lancer le parsing par XSL d'un fichier XML */

	function displayXML (ficxml,ficxsl,place) {
		xml = loadXMLDoc (ficxml, 'xml');
		xsl = loadXMLDoc (ficxsl, 'xml');
		if (document.implementation && document.implementation.createDocument) {
			xsltProcessor = new XSLTProcessor();
			xsltProcessor.importStylesheet(xsl);
			texte = xsltProcessor.transformToFragment(xml,document);
			document.getElementById(place).appendChild(texte);
		}
	}

/* 2) Fonctions pour charger un fichier XML ou plain text */

	// Retourne un text/xml obtenu par une requête http (ou localement, protocol file://)
	// Mode synchrone ==> les donnees sont entièrement disponibles au moment du return
	// Utilisable pour les fichiers xml à parser ou pour du texte (mais non testé)

	function loadXMLDoc (dname,type) {
		xhttp = new XMLHttpRequest();
		if (type == 'xml') {xhttp.overrideMimeType('application/xslt+xml');}
		else               {xhttp.overrideMimeType('application/text');}
		xhttp.open ("GET",dname,false);
		xhttp.send (null);
		if (type == 'xml') return xhttp.responseXML;
		return xhttp.responseText;
	}

/* 3) Manipulation de noms de repertoires/fichiers */

	function getBaseURL() {return direName (location.href.split('?')[0]);}
	function fileName (chemin) {
		var element = chemin.split ('/');
		return element[element.length-1];
	}
	function direName (chemin) {
		var i, chaine, element = chemin.split ('/');
		for (i=0; i<element.length-1; i++) {
			if (i == 0) {chaine = element[0]; continue}
			chaine += '/' + element[i];
		};
		return chaine;
	}

/* 4) Inhibe sélection car c'est très moche et inutile quand on fait shift+click */

	function setNoSelect() {
		if (window.sidebar) {
			document.onmousedown = function() {return false;};
			document.onclick     = function() {return true;}
		}
	}

/* ---------------------------------------------------------------------------------------------- */
