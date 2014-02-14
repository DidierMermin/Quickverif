#!/bin/bash
#	Copyright 2014 Didier Mermin
#	This file is part of Quickverif.
#  	Quickverif is free software: you can redistribute it and/or modify
#	it under the terms of the GNU General Public License as published by
#	the Free Software Foundation, either version 3 of the License, or
#	(at your option) any later version.
#
#	This program is distributed in the hope that it will be useful,
#	but WITHOUT ANY WARRANTY; without even the implied warranty of
#	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#	GNU General Public License for more details.
#
#	You should have received a copy of the GNU General Public License
#	along with Quickverif.  If not, see <http://www.gnu.org/licenses/>.
#--------------------------------------------------------------------------------------------------------------------------------------------
# Execute une requete HTTP fournie depuis une page web et retourne une image
# Syntaxe : QUERY_STRING = URL
# Auteur  : Didier MERMIN
# Date    : 3/12/2013
#--------------------------------------------------------------------------------------------------------------------------------------------
# Affiche fichier en HTML
# Arguments : $1 = fichier
#             $2 = OK/KO (optionnel)
#--------------------------------------------------------------------------------------------------------------------------------------------
output()
{
	case $2 in
	KO)	echo '<html><body bgcolor="silver">
			<div align="left"><font color="red" size="6em"><strong>
			TEST KO
			</strong></font></div>
			<div align="left"><font size="3em"><pre>'
			;;
	OK)	echo '<html><body bgcolor="silver">
			<div align="left"><font color="green" size="6em"><strong>
			TEST OK
			</strong></font></div>
			<div align="left"><font size="3em"><pre>'
			;;
	*)	echo '<html><body bgcolor="silver">
			<div align="left"><font size="3em"><pre>'
			;;
	esac
	cat $1
	echo '</pre></font></div></body></html>'
}
#--------------------------------------------------------------------------------------------------------------------------------------------
# 1. Execute la requete voulue
#--------------------------------
#
trap 'echo Killed; rm -f /tmp/wget_$$.out /tmp/wget_$$.log; exit' 2 3 9 10 13 15 16 17 19 21 24 33 34
/usr/bin/wget --tries=1 -O /tmp/wget_$$.out -o /tmp/wget_$$.log "$QUERY_STRING"       # Ne pas mettre 0 retries ==> infini
#
#--------------------------------
# 2. Echec requete == output vide
#--------------------------------
#
if [ ! -s /tmp/wget_$$.out ]; then
	echo -e "Content-type: text/html\n"
	output /tmp/wget_$$.log KO
	rm -f  /tmp/wget_$$.???
	exit
fi
#
#--------------------------------
# 3. Requete OK
#--------------------------------
#
TYPE=`file /tmp/wget_$$.out`
case $TYPE in
*XML*)  CONTENT=application/xml ;;
*HTML*) CONTENT=text/html  ;;
*PNG*)  CONTENT=image/png  ;;
*JPEG*) CONTENT=image/jpeg ;;
*data*) CONTENT=text/html  ;;                              # Datas binaires illisibles ==> on affichera le log
*ASCI*) CONTENT=text/html  ;;                              # Sera mis en HTML
*)      CONTENT=text/html  ;;                              # Sera mis en HTML
esac
echo -e "Content-type: $CONTENT\n"
case $TYPE in
*PNG*|*JPEG*) cat /tmp/wget_$$.out ;;                      # Rien a formater
*HTML*|*XML*) cat /tmp/wget_$$.out ;;                      # Rien a formater
*data*) output /tmp/wget_$$.log OK ;;                      # Données illisibles
*)	LOOKAT=`head -1 /tmp/wget_$$.out | cut -c1-50 | tr '[a-z]' '[A-Z]'`
	case $LOOKAT in
	*OK*)           output /tmp/wget_$$.out OK ;;
	*KO*)           output /tmp/wget_$$.out KO ;;
	*ERROR*)        output /tmp/wget_$$.out KO ;;
	*BAD.*REQUEST*) output /tmp/wget_$$.out KO ;;
	*)              output /tmp/wget_$$.out    ;;
	esac
esac
rm -f /tmp/wget_$$.???
#
#--------------------------------------------------------------------------------------------------------------------------------------------
