<?xml version="1.0" encoding="UTF-8"?>
<!--
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
-->
<xsl:stylesheet id="BRANCHES_MENU" version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" version="4.0" indent="yes" omit-xml-declaration="yes"
	cdata-section-elements="namelist" media-type="text/xml"/>

<xsl:template match="/">
	<html><body>
	<table width="100%" align="left" cellspacing="0">
		<xsl:apply-templates select="//Ferme"/>
	</table>
	</body></html>
</xsl:template>

<xsl:template match="Ferme">
	<tr><td id="ferme_head_{@Ide}" class="Ferme" align="left">
			<xsl:text>&#160;</xsl:text>
			<font color="#4F84DF"> <xsl:value-of select="@Ide"/> </font>
		</td>
		<td class="Ferme">
			<table id="ferme_table_{@Ide}" cellspacing="0" style="display:block">
			<tr>
				<xsl:for-each select="Domaine/Branche">
					<xsl:call-template name="Branche"/>
				</xsl:for-each>
			</tr>
			</table>
		</td>
	</tr>
</xsl:template>
<!--
Branche
-->
<xsl:template name="Branche">
	<td> <xsl:value-of select="@Separ"/> </td>
	<td	id="BUD_{@Ide}" class="Bouton1" align="left" height="30px"
		onclick="ActiveBRA('{@Ide}');">
		<xsl:value-of select="@Ide"/>
	</td>
</xsl:template>

</xsl:stylesheet>
