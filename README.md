Quickverif
==========

A) Avertissement

   - Quickverif ne fait qu'exécuter des requêtes HTTP sans pouvoir contrôler le résultat.
     Cette limitation n'est due qu'à une contrainte de sécurité qui interdit à 
     Javascript d'inspecter un DOM qui n'est pas dans son propre domaine.

   - L'icone vert signifie simplement que le test a été lancé, qu'il soit OK ou KO.

   - Ne fonctionne pas du tout avec Internet Explorer.

   - Avec Chrome : fonctionne seulement depuis un serveur HTTP.
   
B) Technologies : HTML, XML, XSLT, CSS, Javascript.

C) Utilité

   Ce petit logiciel est très pratique pour quiconque veut vérifier rapidement qu'un serveur
   web répond correctement ou non à des requêtes enregistrées ou improvisées.
          
   C'est un outil de diagnostic rudimentaire mais irremplaçable quand il faut identifier,
   parmi des dizaines possibles, quel(s) serveur(s) échoue(nt) à certains tests.

   On peut aussi l'utiliser comme gestionnaire de raccourcis pour vérifier le fonctionnement
   de certaines pages d'un site web.
   
D) "Getting started"

   - Après avoir extrait les fichiers du package de livraison dans un répertoire de votre choix,
     cliquez sur Quickverif.html : Quickverif est prêt à l'emploi avec une configuration de démo.

   - Cliquez un peu partout de façon à voir par vous-mêmes ce qu'il a dans le ventre.
   
   - Si vous êtes intéressé(e), jetez un oeil sur MODE D'EMPLOI. Si ce lien ne vous saute
     pas aux yeux, alors cliquez sur Home.

   - Si vous pensez que Quickverif peut vous être utile, (ie: vous avez des tas de serveurs
     ou d'applications à tester rapidement), vous avez deux solutions pour l'adapter à vos besoins :
   
     - Solution 1:
   
       - Sauvegarder Config.xml : c'est la config de démonstration qui vous servira d'exemple.
       - Editer Config.xml pour y mettre:

         - les définitions de vos fermes/domaines/branches
         - les définitions de vos applications/tests (penser à remplacer les "&" par leur code HTML)

     - Solution 2:
   
       - Editer un autre fichier de configuration, par exemple Myconfig.xml
       - Lancer Quickverif en collant, à la fin de l'URL: ?Myconfig.xml (Cf. MODE D'EMPLOI)

Didier Mermin
Paris, le 8 février 2014
