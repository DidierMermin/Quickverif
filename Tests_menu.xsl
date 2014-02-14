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
<!DOCTYPE html PUBLIC "-//W3C//DTD Xhtml 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">
<xsl:stylesheet id="TESTS_MENU" version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" version="4.0" indent="yes" omit-xml-declaration="yes"
	cdata-section-elements="namelist" media-type="text/xml"/>

<xsl:template match="/">
	<table id="TableTests" align="left" cellspacing="0">
		<tr><td id="Entete" colspan="2" align="left"></td></tr>
		<tr>
			<td valign="top">
				<table align="left" cellpadding="2" cellspacing="0" width="220">
					<xsl:apply-templates select="//Application/Test[count(preceding::Test) mod '2' = '0']"/>
				</table>
			</td>
			<td valign="top">
				<table align="left" cellpadding="2" cellspacing="0" width="220">
					<xsl:apply-templates select="//Application/Test[count(preceding::Test) mod '2' = '1']"/>
				</table>
			</td>
		</tr>
	</table>
</xsl:template>

<xsl:template match="Test">
	<xsl:variable name="appli" select="../@Ide"/>
	<tr class="Test" id="test_{$appli}_{@Ide}" style="display:none" title="{$appli}"
		onclick="runTest(event,'{$appli}','{@Ide}'); return false;">
		<td class="Icones" valign="center" align="left">
			<img id="img_{$appli}_{@Ide}" src="images/point.png"></img>
		</td>
		<td class="Link" valign="center" align="left">
			<xsl:value-of select="@Ide"/>
		</td>
	</tr>
</xsl:template>

</xsl:stylesheet>
