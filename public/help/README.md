# Mass fragmentation

## Simulation of mass fragmentation

Analysis of mass fragments of small molecules obtained for example by electronic impact may be cumbersome.

In order to facilitate the process, this tool allow to draw a molecule and select the breakable bonds. The system will the generate all the possible fragments and will recombinate them.

#### Select the ionisation method

In order to observe a mass spectrum the molecule has to be charged and this ionization has an impact on the mass. You may enter a list of ionizations that was applied to the molecule in the following box:

![image](./help/images/ionizations.png) 


For instance for electronic impact you would enter a simple ‘+’. Meaning that we have removed an electron to charge the molecule.

#### Draw / edit the molecule

You may either draw a molecule directly in the editor or paste a molfile coming from another software. For instance if you have a molecule in ChemDraw™ you may select the molecule and ‘Edit -&gt; Copy as … -&gt; MOL Text’. Then you may put the mouse over the drawing applet and press ‘CTRL + V’ \(on windows\) or ⌘ + V’ on mac.

If you would like to draw efficiently the molecules directly in the editor click on the little question mark and try to learn all the shortcuts.

![image](./help/images/jsme-help.png) 


#### Define the cleavable bonds

In the drawing applet you should select the blue bullet icon and click on the bonds that are breakable.

![image](./help/images/break.png) 

The fragments with their corresponding mass will calculated on the fly as well all the possible recombinations of those fragments. This may be useful to determine unknown side products of a reaction.

#### Analyse the results

A virtual spectrum will all the possibility is generated and a mouse over the annotation over the peak will highlight the required parts of the molecules to reach the mass.

![image](./help/images/analyze.png) 


If you have a XY text file or jcamp containing an experimental spectrum you may directly drag and drop or paste on the drop zone.

You may also have mass spectra saved in the database and one click on the name will superimpose the spectrum to the predicted one.
