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
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" version="4.0" indent="yes"/>
<xsl:template match="/*">
	<xsl:call-template name="Frames"/>
</xsl:template>

<xsl:template name="Frames">
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'1'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'3'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'5'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'7'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'9'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'11'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'13'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'15'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'17'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'19'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'21'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'23'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'25'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'27'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'29'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'31'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'33'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'35'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'37'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'39'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'41'"/>
		</xsl:call-template>
		<xsl:call-template name="twoFrame">
			<xsl:with-param name="num" select="'43'"/>
		</xsl:call-template>
</xsl:template>

<xsl:template name="twoFrame">
	<xsl:param name="num"/>
	<table><tr>
		<xsl:call-template name="oneFrame">
			<xsl:with-param name="num" select="$num"/>
		</xsl:call-template>
		<xsl:call-template name="oneFrame">
			<xsl:with-param name="num" select="$num + 1"/>
		</xsl:call-template>
	</tr></table>
</xsl:template>

<xsl:template name="oneFrame">
	<xsl:param name="num"/>
	<td align="left">
	<!-- Ci-dessous, cacher l'overflow évite d'avoir de grands espaces vides entre les frames. -->
	<div id="parent_{$num}" style="height:418; overflow:hidden; display:none;">
		<img id="reload_{$num}" onclick="'#Keep me !'" 
			 style="cursor:pointer; position:relative; top:45px; left:545px; z-index:3;"
			 src="images/rejouer.png" height="50px" width="50px"
			 title="Rejouer"/>
		<form id="form_{$num}" style="position:relative; top:-40px; left:0px; z-index:1;">
			<fieldset>
			<legend>
				<a onclick="'#Keep me !'">&nbsp;<xsl:value-of select="$num"/>&nbsp;</a>
			</legend>
			<iframe class="Frames" onload="'#Keep this !'" style="background-color:silver"
				id="frame_{$num}" name="frame_{$num}" width="615px" height="360px" scrolling="auto" frameborder="1">
			</iframe>
			</fieldset>
		</form>
	</div>
	</td>
</xsl:template>

</xsl:stylesheet>
