<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet id="APPLIS_MENU" version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" version="4.0" indent="yes" omit-xml-declaration="yes"
	cdata-section-elements="namelist" media-type="text/xml"/>

<xsl:template match="/">
	<html><body>
	<table width="100%" align="left" cellspacing="0">
		<xsl:for-each select="//Application">
			<xsl:sort select="Ide" data-type="text" case-order="lower-first"/>
			<xsl:call-template name="uneAppli"/>
		</xsl:for-each>
	</table>
	</body></html>
</xsl:template>

<xsl:template name="uneAppli">
	<xsl:variable name="APPLI" select="@Ide"/> 
	<tr><td id="appli_head_{$APPLI}" class="Ferme" align="left">
			<xsl:text>&#160;</xsl:text>
			<font color="#4F84DF"> <xsl:value-of select="$APPLI"/> </font>
		</td>
		<td class="Ferme">
			<table id="appli_table_{$APPLI}" cellspacing="0" style="display:block">
			<tr>
				<xsl:apply-templates select="//Domaine/Refapp[@Nom=$APPLI]/../Branche | //Branche/Refapp[@Nom=$APPLI]/..">
					<xsl:with-param name="nomAppli" select="$APPLI"/>
				</xsl:apply-templates>
			</tr>
			</table>
		</td>
	</tr>
</xsl:template>
<!--
Branche
-->
<xsl:template match="Branche">
	<xsl:param name="nomAppli"/>
	<td	id="BUD_{@Ide}_{$nomAppli}" class="Bouton1" align="left" height="30px"
		onclick="ActiveAPP ('{@Ide}','{$nomAppli}');">
		<xsl:value-of select="@Ide"/>
	</td>
</xsl:template>

</xsl:stylesheet>
