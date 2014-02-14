Quickverif
==========

A) Avertissement

   - Quickverif ne fait qu'ex�cuter des requ�tes HTTP sans pouvoir contr�ler le r�sultat.
     Cette limitation n'est due qu'� une contrainte de s�curit� qui interdit � 
     Javascript d'inspecter un DOM qui n'est pas dans son propre domaine.

   - L'icone vert signifie simplement que le test a �t� lanc�, qu'il soit OK ou KO.

   - Ne fonctionne pas du tout avec Internet Explorer.

   - Avec Chrome : fonctionne seulement depuis un serveur HTTP.
   
B) Technologies : HTML, XML, XSLT, CSS, Javascript.

C) Utilit�

   Ce petit logiciel est tr�s pratique pour quiconque veut v�rifier rapidement qu'un serveur
   web r�pond correctement ou non � des requ�tes enregistr�es ou improvis�es.
          
   C'est un outil de diagnostic rudimentaire mais irrempla�able quand il faut identifier,
   parmi des dizaines possibles, quel(s) serveur(s) �choue(nt) � certains tests.

   On peut aussi l'utiliser comme gestionnaire de raccourcis pour v�rifier le fonctionnement
   de certaines pages d'un site web.
   
D) "Getting started"

   - Apr�s avoir extrait les fichiers du package de livraison dans un r�pertoire de votre choix,
     cliquez sur Quickverif.html : Quickverif est pr�t � l'emploi avec une configuration de d�mo.

   - Cliquez un peu partout de fa�on � voir par vous-m�mes ce qu'il a dans le ventre.
   
   - Si vous �tes int�ress�(e), jetez un oeil sur MODE D'EMPLOI. Si ce lien ne vous saute
     pas aux yeux, alors cliquez sur Home.

   - Si vous pensez que Quickverif peut vous �tre utile, (ie: vous avez des tas de serveurs
     ou d'applications � tester rapidement), vous avez deux solutions pour l'adapter � vos besoins :
   
     - Solution 1:
   
       - Sauvegarder Config.xml : c'est la config de d�monstration qui vous servira d'exemple.
       - Editer Config.xml pour y mettre:

         - les d�finitions de vos fermes/domaines/branches
         - les d�finitions de vos applications/tests (penser � remplacer les "&" par leur code HTML)

     - Solution 2:
   
       - Editer un autre fichier de configuration, par exemple Myconfig.xml
       - Lancer Quickverif en collant, � la fin de l'URL: ?Myconfig.xml (Cf. MODE D'EMPLOI)

Didier Mermin
Paris, le 8 f�vrier 2014
