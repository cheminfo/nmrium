# Changelog

### [0.20.3](https://www.github.com/cheminfo/nmrium/compare/v0.20.2...v0.20.3) (2022-03-03)


### Bug Fixes

* manual option of changing an integral sum not selected in the exercise mode ([70640e9](https://www.github.com/cheminfo/nmrium/commit/70640e9e33d338338c578d224625d7e185833aff)), closes [#1397](https://www.github.com/cheminfo/nmrium/issues/1397)
* Processed file can not be loaded on dev.nmrium.org ([0a51dd5](https://www.github.com/cheminfo/nmrium/commit/0a51dd5f84891972b9b7fc17ca941bd66e4263e2)), closes [#1316](https://www.github.com/cheminfo/nmrium/issues/1316)
* select tool by pressing its shortcut when no spectrum is selected ([61bd971](https://www.github.com/cheminfo/nmrium/commit/61bd9713083a0545a5b5b92a4ca7c0eb704677e9)), closes [#1373](https://www.github.com/cheminfo/nmrium/issues/1373)
* zoom history in 2D ([c2c989a](https://www.github.com/cheminfo/nmrium/commit/c2c989ab64eb08ff5f4990328ee7c02d8b275807)), closes [#1371](https://www.github.com/cheminfo/nmrium/issues/1371)

### [0.20.2](https://www.github.com/cheminfo/nmrium/compare/v0.20.1...v0.20.2) (2022-02-28)


### Bug Fixes

* update and dedupe dependencies ([#1383](https://www.github.com/cheminfo/nmrium/issues/1383)) ([4995931](https://www.github.com/cheminfo/nmrium/commit/4995931f5b4d4beee55800b688ca91b088fb9df6))

### [0.20.1](https://www.github.com/cheminfo/nmrium/compare/v0.20.0...v0.20.1) (2022-02-24)


### Bug Fixes

* workaround duplicate cheminfo-types ([a2eb9d2](https://www.github.com/cheminfo/nmrium/commit/a2eb9d21c0e83761049f82fc64e822dd8d8302cd))

## [0.20.0](https://www.github.com/cheminfo/nmrium/compare/v0.19.1...v0.20.0) (2022-02-23)


### Features

* add colored text to the ZonesTable (F1 - F2) ([fbcad47](https://www.github.com/cheminfo/nmrium/commit/fbcad4791ede14db2937684f1e04f098c37e7c07))
* add exclusion zones filter ([#1376](https://www.github.com/cheminfo/nmrium/issues/1376)) ([5d0cdf4](https://www.github.com/cheminfo/nmrium/commit/5d0cdf4a79da7087e1df6b1698bea75f13469319))
* open Zone panel while you click on the sidebar tool ([#1369](https://www.github.com/cheminfo/nmrium/issues/1369)) ([c0fb1c0](https://www.github.com/cheminfo/nmrium/commit/c0fb1c09369f5d10c4841dbfe055180a8af17d66))


### Bug Fixes

* autoRanges detection for HR spectra ([bc9f475](https://www.github.com/cheminfo/nmrium/commit/bc9f4759efa4b283dc5d398d7745b642010d91a7))
* change san plot text to be displayed in line ([#1350](https://www.github.com/cheminfo/nmrium/issues/1350)) ([efe0f0a](https://www.github.com/cheminfo/nmrium/commit/efe0f0a4b4f94df2535fc51390956f5320db840b))
* create an empty molecule throws an error ([a99d95c](https://www.github.com/cheminfo/nmrium/commit/a99d95c03c95aeaf7d54a3fcd695cd36d3754eea))
* make the "Structures" responsive ([#1361](https://www.github.com/cheminfo/nmrium/issues/1361)) ([59df13f](https://www.github.com/cheminfo/nmrium/commit/59df13f1bf85ec9f873e72ffd9392f715487729e))
* prevent crash if range picking without finding peaks ([e472eaa](https://www.github.com/cheminfo/nmrium/commit/e472eaa15cfb887abecd6c08f6e51cadf460d955))
* prevent crash in auto-range picking ([2b52066](https://www.github.com/cheminfo/nmrium/commit/2b520663186c1b50cd6574525c873e6c581d1851))
* prevent crash with multiplet analysis ([#1356](https://www.github.com/cheminfo/nmrium/issues/1356)) ([ca8fb76](https://www.github.com/cheminfo/nmrium/commit/ca8fb7653b072a0dbb97ad8f76b13f88777b92f0))
* remove useless calculation in BrushTracker and replace it by a real test ([50c4d3b](https://www.github.com/cheminfo/nmrium/commit/50c4d3bee8c57a12481ca89912d6622e88449c44))
* resolve crash on recall zoom level ([#1349](https://www.github.com/cheminfo/nmrium/issues/1349)) ([cc13abc](https://www.github.com/cheminfo/nmrium/commit/cc13abc18f77b6787b923e3c4edaef51750d9e90))
* resolve error on zoom ([6285e22](https://www.github.com/cheminfo/nmrium/commit/6285e22321c5994751aa10bced5fcaed265fb4d3))
* resolve missing key error ([#1355](https://www.github.com/cheminfo/nmrium/issues/1355)) ([3436331](https://www.github.com/cheminfo/nmrium/commit/3436331a82c04f743cc12adb458b6fb3a5c41de0))
* resolve shifting issue with chart 2D ([#1364](https://www.github.com/cheminfo/nmrium/issues/1364)) ([4b219b5](https://www.github.com/cheminfo/nmrium/commit/4b219b5b4240101c0b10090e91cf72a7292c4606))
* we remove the condition that an atom may only be assigned once ([035887c](https://www.github.com/cheminfo/nmrium/commit/035887c2c383eebec463128734908490e9b84760))
* wrap main nmrium component in error boundary ([f5d8de1](https://www.github.com/cheminfo/nmrium/commit/f5d8de13b932d739de1e8a5fff361f02346a2d9e))

### [0.19.1](https://www.github.com/cheminfo/nmrium/compare/v0.19.0...v0.19.1) (2022-01-24)


### Bug Fixes

* rescale the molecule according to available space ([#1339](https://www.github.com/cheminfo/nmrium/issues/1339)) ([72b6642](https://www.github.com/cheminfo/nmrium/commit/72b6642b25146bff10476f7a9f42a378cea8eb0e))

## [0.19.0](https://www.github.com/cheminfo/nmrium/compare/v0.18.3...v0.19.0) (2022-01-24)


### Features

* complete database panel with filters ([1641d90](https://www.github.com/cheminfo/nmrium/commit/1641d909d03de0d0a2f667c33b9ec9a276f6c080)), closes [#1254](https://www.github.com/cheminfo/nmrium/issues/1254) [#1255](https://www.github.com/cheminfo/nmrium/issues/1255) [#1256](https://www.github.com/cheminfo/nmrium/issues/1256) [#1257](https://www.github.com/cheminfo/nmrium/issues/1257)
* Display integrals for the ranges ([2644fae](https://www.github.com/cheminfo/nmrium/commit/2644faed147ed9339e8b993fe55b6f19421d65e9)), closes [#1225](https://www.github.com/cheminfo/nmrium/issues/1225)
* Display spectra for each range when mouse enter over database record ([6b457f8](https://www.github.com/cheminfo/nmrium/commit/6b457f80ddcf4c13fe4a4c3e594ec693eb92de1e))
* generate spectrum from publication string ([2b5d66a](https://www.github.com/cheminfo/nmrium/commit/2b5d66a90230d738c6a4c719f0de5502ffcb5a74))
* improvements correlation table, i.e. allow movement of links ([#1268](https://www.github.com/cheminfo/nmrium/issues/1268)) ([2410e65](https://www.github.com/cheminfo/nmrium/commit/2410e65f036a90dd730c02c5cb8827eee7fa5925))
* Integral scaling ([1f16152](https://www.github.com/cheminfo/nmrium/commit/1f1615204c9e98adec42ff8705ac1321e174b534))
* J Graph ([#1311](https://www.github.com/cheminfo/nmrium/issues/1311)) ([cebc3c0](https://www.github.com/cheminfo/nmrium/commit/cebc3c02cf1aa862bc11743b8edc85330e5e68c4))
* resurrect spectrum from database set ([cf6c8b0](https://www.github.com/cheminfo/nmrium/commit/cf6c8b0b5828c96a5d256efa8785ecf0aee9bec7)), closes [#1259](https://www.github.com/cheminfo/nmrium/issues/1259)
* resurrect spectrum from database spectrum ([010129f](https://www.github.com/cheminfo/nmrium/commit/010129fef5d44dd5723678c11973949c6f911f8d)), closes [#1259](https://www.github.com/cheminfo/nmrium/issues/1259)
* use nmr processing types ([#1310](https://www.github.com/cheminfo/nmrium/issues/1310)) ([fc576ef](https://www.github.com/cheminfo/nmrium/commit/fc576efad1ef78678e144e00193c5a350c2a3c88))


### Bug Fixes

* avoid enhanceSymmetry for manual zone detection ([e5be7ca](https://www.github.com/cheminfo/nmrium/commit/e5be7caa5834ba866dc67c046e5b14e89d2ce8da))
* basic panel style import ([b46bdd4](https://www.github.com/cheminfo/nmrium/commit/b46bdd4fc8d59bacf38e2f05a034b08136f5b747))
* Center and stacked function/icon for FID files ([0e22f8c](https://www.github.com/cheminfo/nmrium/commit/0e22f8ca19bfe896fd815735b855533de7aaee51))
* crashes due to missing plural name of peak in nmr-correlation ([#1237](https://www.github.com/cheminfo/nmrium/issues/1237)) ([907ade3](https://www.github.com/cheminfo/nmrium/commit/907ade3e0a1f1e9535f3ddc7f60164c64ceab868))
* increase default frequency cluster close [#1309](https://www.github.com/cheminfo/nmrium/issues/1309) ([e326ca4](https://www.github.com/cheminfo/nmrium/commit/e326ca4b58c1095e39d7b958d82bbf00711ba463))
* nmredata importation ([#1292](https://www.github.com/cheminfo/nmrium/issues/1292)) ([8e252a3](https://www.github.com/cheminfo/nmrium/commit/8e252a3ea910990c779074cee07331b7872bf6db))
* refactor nH parameter to integrationSum close [#1318](https://www.github.com/cheminfo/nmrium/issues/1318) ([#1319](https://www.github.com/cheminfo/nmrium/issues/1319)) ([1138d1d](https://www.github.com/cheminfo/nmrium/commit/1138d1d9b5b46015273df1a3fe84f4bc8675c987))
* save preferences ([7c13cc9](https://www.github.com/cheminfo/nmrium/commit/7c13cc91bfc81878fd2d3754fc441ace59b38d98))
* summary header styles ([#1296](https://www.github.com/cheminfo/nmrium/issues/1296)) ([ee1d0b9](https://www.github.com/cheminfo/nmrium/commit/ee1d0b9f82c7f44bae0b57eb819525ef2c4d895e))
* summation field annotation when assigned ([5752608](https://www.github.com/cheminfo/nmrium/commit/575260855b15e1a899b80902ead493f31ca2df23))
* table style when panel filp ([71702b9](https://www.github.com/cheminfo/nmrium/commit/71702b99d88c372f0f2da0af11f5a4fc69591d9e))
* table style when panel flip ([51cd874](https://www.github.com/cheminfo/nmrium/commit/51cd874403d593ab851f309fe47dbb70b4d1c251))
* Toolbar menu y transform when menu greater than screen height ([cf704d3](https://www.github.com/cheminfo/nmrium/commit/cf704d3fc6081bca7d81ffa726f8dc40a26d65b1))
* update minor deps and remove react-card-flip ([#1321](https://www.github.com/cheminfo/nmrium/issues/1321)) ([54b7608](https://www.github.com/cheminfo/nmrium/commit/54b7608cf266b6f69f2776a8a6a7646ad7c7f1d4))
* update nmr-processing to 3.3.1 ([eacea85](https://www.github.com/cheminfo/nmrium/commit/eacea85c68a203766a8abe6f1ee3b2a457c8be99))

### [0.18.3](https://www.github.com/cheminfo/nmrium/compare/v0.18.2...v0.18.3) (2021-09-05)


### Bug Fixes

* calculate the chart for NMR multiplet analysis ([b8279eb](https://www.github.com/cheminfo/nmrium/commit/b8279eb4993bcd5ef0df035a7a19a398be30b75c))

### [0.18.2](https://www.github.com/cheminfo/nmrium/compare/v0.18.1...v0.18.2) (2021-09-02)


### Bug Fixes

* add playwright* in tsconfig exclude ([f4eebc0](https://www.github.com/cheminfo/nmrium/commit/f4eebc0d39dacf9bff9ed8072486eaefac85f1dd))

### [0.18.1](https://www.github.com/cheminfo/nmrium/compare/v0.18.0...v0.18.1) (2021-09-02)


### Bug Fixes

* diaID to diaIDs in spectrum2D ([dd737c5](https://www.github.com/cheminfo/nmrium/commit/dd737c5c3fcc71487502a36aa6c6ddfe38922053))
* ensure plural js in multiplet-analysis ([eeb68f0](https://www.github.com/cheminfo/nmrium/commit/eeb68f0a1833c41380bc28871b98afc2e00acc7d))
* **jeol:** update nmr-parser to 1.6.2 ([b741c65](https://www.github.com/cheminfo/nmrium/commit/b741c65c0027f471b03bcd62736515923bbea23a))
* Peak annotations are not displayed correctly in Safari ([9233c9d](https://www.github.com/cheminfo/nmrium/commit/9233c9d7c30438bc9d8ce6314ee25f7898b32845)), closes [#1219](https://www.github.com/cheminfo/nmrium/issues/1219)
* update nmredata to 0.5.0 ([8c9b530](https://www.github.com/cheminfo/nmrium/commit/8c9b53083963390a4e6e0f081537bc72a0717971))
* wrong behavior in integration of the assigned signal ([#1224](https://www.github.com/cheminfo/nmrium/issues/1224)) ([b720846](https://www.github.com/cheminfo/nmrium/commit/b7208464da3c7b0b4e8300ce0626d8ae3270ea0b))

## [0.18.0](https://www.github.com/cheminfo/nmrium/compare/v0.17.1...v0.18.0) (2021-08-27)


### Features

* 1d and 2d prediction ([#1194](https://www.github.com/cheminfo/nmrium/issues/1194)) ([f5cb228](https://www.github.com/cheminfo/nmrium/commit/f5cb228a0927d059daa107b099b19c136228a45b))
* add prop to hide panel on initial load ([#1171](https://www.github.com/cheminfo/nmrium/issues/1171)) ([b0cdd08](https://www.github.com/cheminfo/nmrium/commit/b0cdd08a1b427ce6d73b5f84dd721a1d14113dcd))
* Automatic ranges / zones picking in all spectra ([31302a2](https://www.github.com/cheminfo/nmrium/commit/31302a2ed36726d028c3435bef47db62e45a0e50)), closes [#1212](https://www.github.com/cheminfo/nmrium/issues/1212)
* integrate with new carbon prediction service ([943432e](https://www.github.com/cheminfo/nmrium/commit/943432ef6dffba3a4c747d7a0d1fb3b6a2a52286))
* predict carbon from molfile ([8706b0e](https://www.github.com/cheminfo/nmrium/commit/8706b0ec6aeaa62f74bc2ffb335b46157a019b3a))


### Bug Fixes

* displayer crash when cursor come over 1d trace in 2d mode ([e8080a9](https://www.github.com/cheminfo/nmrium/commit/e8080a9206de27a2f6b68de1e41dd8973b6e94a6))
* gray lines indicators do not appear on prediction ([5e33fc7](https://www.github.com/cheminfo/nmrium/commit/5e33fc7ad8efa80c1d83ce9649d946e91f2882eb)), closes [#1211](https://www.github.com/cheminfo/nmrium/issues/1211)
* Range edition not working anymore ([2469601](https://www.github.com/cheminfo/nmrium/commit/2469601f3cd946edcfb6bb78cbebfe2718d3d2f4))

### [0.17.1](https://www.github.com/cheminfo/nmrium/compare/v0.17.0...v0.17.1) (2021-07-14)


### Bug Fixes

* set a default value for the data prop ([7daf6f4](https://www.github.com/cheminfo/nmrium/commit/7daf6f455eab1ed3b1bf14040cc5b1672de70b91))

## [0.17.0](https://www.github.com/cheminfo/nmrium/compare/v0.16.0...v0.17.0) (2021-07-14)


### Features

* change signal delta manually ([e079084](https://www.github.com/cheminfo/nmrium/commit/e079084cb6d62c7aa365ce10ab64e2b2948cc780))
* live update the tree during edition ([2886523](https://www.github.com/cheminfo/nmrium/commit/2886523a6994e0051fc7d9821d2c7616dd571cf2)), closes [#1079](https://www.github.com/cheminfo/nmrium/issues/1079)


### Bug Fixes

* [#879](https://www.github.com/cheminfo/nmrium/issues/879), [#898](https://www.github.com/cheminfo/nmrium/issues/898), [#961](https://www.github.com/cheminfo/nmrium/issues/961) and [#1089](https://www.github.com/cheminfo/nmrium/issues/1089) ([#1149](https://www.github.com/cheminfo/nmrium/issues/1149)) ([66dced0](https://www.github.com/cheminfo/nmrium/commit/66dced0b785625a8eaa00f80850af8476b6b428c))
* avoid re-renders due to the AlertProvider ([67f4edf](https://www.github.com/cheminfo/nmrium/commit/67f4edfa8da8c86e46134590335c8b0d6d035977))
* baseline correction crash when "degree" not between 1 - 6 ([defa111](https://www.github.com/cheminfo/nmrium/commit/defa111d9d4ecbdc893daec0896b6fb22c1e9c5f))
* correct style of molecule editor modal and ranges header outside of Vite ([7fa7775](https://www.github.com/cheminfo/nmrium/commit/7fa77753f7a3d6c7d79b5370ee7830a0ab5bec7f))
* do not use nullish coalescing operator ([1503727](https://www.github.com/cheminfo/nmrium/commit/150372717efe684efe715dfcfec51235b3a70b85))
* fill value in  signal input field when select range not working ([aa837fe](https://www.github.com/cheminfo/nmrium/commit/aa837fe2a76f993ba3dcacb5c19fbe22319a6961))
* prevent re-renders due to chart data provider ([e72c8c7](https://www.github.com/cheminfo/nmrium/commit/e72c8c718d14e375013022007d4018b1baf68074))
* prevent re-renders due to dropzone loader ([68c5879](https://www.github.com/cheminfo/nmrium/commit/68c58791dc531ada2779e5fd99aab7f77d195056))
* prevent re-renders due to modal provider ([882d160](https://www.github.com/cheminfo/nmrium/commit/882d160d2661ece9974739a9c29e4e85db073920))
* simplify help provider to avoid re-renders ([54cb76c](https://www.github.com/cheminfo/nmrium/commit/54cb76c082bf08df549760d75ee8458ac60834b1))
* update nmr-parser to 1.6.0 close[#1145](https://www.github.com/cheminfo/nmrium/issues/1145) ([#1156](https://www.github.com/cheminfo/nmrium/issues/1156)) ([532f2d5](https://www.github.com/cheminfo/nmrium/commit/532f2d5cffb352544f049bde97c357a43c17e1a3))
* use Delete instead of Escape as Backspace alias ([cd04968](https://www.github.com/cheminfo/nmrium/commit/cd049689d5acfa1ea8231791480b9bfedc5098de))

## [0.16.0](https://www.github.com/cheminfo/nmrium/compare/v0.15.0...v0.16.0) (2021-06-21)


### ⚠ BREAKING CHANGES

* The docsBaseUrl prop was removed. Documentation will always be at https://docs.nmrium.org

### Bug Fixes

* convert value to string crash when have null value ([c632ee9](https://www.github.com/cheminfo/nmrium/commit/c632ee98359f9b58dac3f001a857500ce29c9398)), closes [#1144](https://www.github.com/cheminfo/nmrium/issues/1144)
* Drag and drop jcamp -> export -> import not working ([870d82a](https://www.github.com/cheminfo/nmrium/commit/870d82a1a3cfc0d9a7d1d72d27d4f451612d4a56)), closes [#1143](https://www.github.com/cheminfo/nmrium/issues/1143)
* Help broken ([fbaec53](https://www.github.com/cheminfo/nmrium/commit/fbaec535c2ed6c44be355bc4cc24ac6d52604552)), closes [#1132](https://www.github.com/cheminfo/nmrium/issues/1132)
* integral in fixed mode for integrals and ranges ([eaf7d4a](https://www.github.com/cheminfo/nmrium/commit/eaf7d4af23b9841c721da0c740978d04c9522f08)), closes [#1131](https://www.github.com/cheminfo/nmrium/issues/1131)
* Prop validation error when closing the right panels area ([ad1028e](https://www.github.com/cheminfo/nmrium/commit/ad1028e384714ebee0b9413b351d7396fbb1129e)), closes [#1141](https://www.github.com/cheminfo/nmrium/issues/1141)
* Ranges are displayed incorrectly in case of spectrum shifts ([985b583](https://www.github.com/cheminfo/nmrium/commit/985b5830e76bb86a89229a13d4b46b4d170cc5c5))


### Miscellaneous Chores

* remove docsBaseUrl and refactor constants ([c8a35af](https://www.github.com/cheminfo/nmrium/commit/c8a35af896bc483e80ba4fd1410de5985174b93f))

## [0.15.0](https://www.github.com/cheminfo/nmrium/compare/v0.14.0...v0.15.0) (2021-06-17)


### Features

* allows to continue to control phase when mouse leave the button ([613e5da](https://www.github.com/cheminfo/nmrium/commit/613e5da80b1c454c5cbc92de1c682b04c8eee9e5))
* improve error message ([68eda7c](https://www.github.com/cheminfo/nmrium/commit/68eda7c67368f3b4c7eea2366300afe34bfbe27e))
* update nmr-parser to 1.4.0 ([11d13b7](https://www.github.com/cheminfo/nmrium/commit/11d13b7985471d0ff16e64d1c85730e691314606))


### Bug Fixes

* change props to be non-required ([40dd75c](https://www.github.com/cheminfo/nmrium/commit/40dd75c9bb966d0f00475c900431458ee2519391))
* close [#1112](https://www.github.com/cheminfo/nmrium/issues/1112) ([#1114](https://www.github.com/cheminfo/nmrium/issues/1114)) ([5990eed](https://www.github.com/cheminfo/nmrium/commit/5990eedd0a4df4768bd6bf9bac685ccc993afebe))
* edit range manually crash ([254d10f](https://www.github.com/cheminfo/nmrium/commit/254d10fd9718887201062e8afb573c7d0c7962b4)), closes [#1124](https://www.github.com/cheminfo/nmrium/issues/1124)
* formating and filter general bugs ([ea19f6d](https://www.github.com/cheminfo/nmrium/commit/ea19f6db1b79d9cfd16c842c3fa3e73c6b6bead2)), closes [#1135](https://www.github.com/cheminfo/nmrium/issues/1135) [#1134](https://www.github.com/cheminfo/nmrium/issues/1134) [#1133](https://www.github.com/cheminfo/nmrium/issues/1133)
* improve phase correction ([c3d889e](https://www.github.com/cheminfo/nmrium/commit/c3d889ebe21eba02bac71c65d4646417807c9b96))
* integral value under integral plot not updating ([04a062b](https://www.github.com/cheminfo/nmrium/commit/04a062be16d6f82e23098c970596ad7183ce3f14)), closes [#1123](https://www.github.com/cheminfo/nmrium/issues/1123)
* Phase correction shortcut not working ([c56592d](https://www.github.com/cheminfo/nmrium/commit/c56592d238576eb6d1e074586087c487d81f41fe)), closes [#1121](https://www.github.com/cheminfo/nmrium/issues/1121)
* sanplot when not negative/positive values exist ([aa90fa0](https://www.github.com/cheminfo/nmrium/commit/aa90fa0c0e080f2be9190addc3bc745eb432c76f))
* use useRef ([b360911](https://www.github.com/cheminfo/nmrium/commit/b360911047fb9885a077863b86d882536f775382))

## [0.14.0](https://www.github.com/cheminfo/nmrium/compare/v0.13.0...v0.14.0) (2021-05-20)


### Features

* enhance sanplot ([#1090](https://www.github.com/cheminfo/nmrium/issues/1090)) ([adf371b](https://www.github.com/cheminfo/nmrium/commit/adf371b8f72d38c2a3eac74d447961f32bdb6e7c))
* improve default values for auto phase. close [#1093](https://www.github.com/cheminfo/nmrium/issues/1093) ([#1099](https://www.github.com/cheminfo/nmrium/issues/1099)) ([a2d67a4](https://www.github.com/cheminfo/nmrium/commit/a2d67a40119467da7d4931cfa118d1488a83a404))


### Bug Fixes

* allow to save as shortcut on osX ([ade53cd](https://www.github.com/cheminfo/nmrium/commit/ade53cdde82430ddd1ba0fd4be8d503fa79ed30d))
* always use the zones for polynomial baseline correction. ([#1092](https://www.github.com/cheminfo/nmrium/issues/1092)) ([cf7fa99](https://www.github.com/cheminfo/nmrium/commit/cf7fa99f5852f06a3be604e976df036591a23609))
* build demo site using relative URLs ([8e4f668](https://www.github.com/cheminfo/nmrium/commit/8e4f668498a982f3a24ffc4c041ad1edf5eb2ffc))
* change integral sum modal style ([e5cf78e](https://www.github.com/cheminfo/nmrium/commit/e5cf78e4e86c2b0dfec2909dab64d4f2344609b5)), closes [#1062](https://www.github.com/cheminfo/nmrium/issues/1062)
* crash when add spectra filter ([1a6ab62](https://www.github.com/cheminfo/nmrium/commit/1a6ab62e2f75590590761cacd61a19a3ba76c0ae)), closes [#1083](https://www.github.com/cheminfo/nmrium/issues/1083)
* In "Export As" data included even when "include data" unchecked ([5aa068a](https://www.github.com/cheminfo/nmrium/commit/5aa068a6c486f815d7c3cdbbcc997224113da7f0))
* **projection:** fix wrong number of points. close [#1041](https://www.github.com/cheminfo/nmrium/issues/1041) ([#1095](https://www.github.com/cheminfo/nmrium/issues/1095)) ([44139a0](https://www.github.com/cheminfo/nmrium/commit/44139a049363d6987b869985689c000d44ab8ae0))

## [0.13.0](https://www.github.com/cheminfo/nmrium/compare/v0.12.0...v0.13.0) (2021-05-13)


### Features

* add getAtomsFromMF ([e29bcbf](https://www.github.com/cheminfo/nmrium/commit/e29bcbf56fcbf89ae76fbb1c37f485b606d03140))
* update dependencies nmr-parser and ml-spectra-processing ([#1042](https://www.github.com/cheminfo/nmrium/issues/1042)) ([d443fd7](https://www.github.com/cheminfo/nmrium/commit/d443fd7e3bd9d34ecf9ccaa7e38153bef9e4f802))


### Bug Fixes

* better display for version and link to github ([4a2d70f](https://www.github.com/cheminfo/nmrium/commit/4a2d70fbfc674451b6b3b30f89ab5c77285b05c9))
* crash when edit and save range. ([907b49f](https://www.github.com/cheminfo/nmrium/commit/907b49f214f1d26dc47c536d8f6500be97c8ebd7)), closes [#1031](https://www.github.com/cheminfo/nmrium/issues/1031)
* do not import lodash directly ([ca47250](https://www.github.com/cheminfo/nmrium/commit/ca47250f078bc6d138ca4013076d148e739a5d8c))

## [0.12.0](https://www.github.com/cheminfo/nmrium/compare/v0.11.0...v0.12.0) (2021-05-07)


### Features

* " Export As " feature ([60e6430](https://www.github.com/cheminfo/nmrium/commit/60e6430fafd6ae7a40dddf4ba3cf66c1425cdd06))
* 1d histogram ([e4178f1](https://www.github.com/cheminfo/nmrium/commit/e4178f1f780eb55e7d9cbe6db59e5d4fd93e9134))
* 2d histogram ([50f83da](https://www.github.com/cheminfo/nmrium/commit/50f83dab4ed176dde8c9ed56e225b72d28610d5a))
* add equally spaced filter. ([5d9953c](https://www.github.com/cheminfo/nmrium/commit/5d9953c6722efd45d02a4810324fe6976f74a822))
* add new filters ([cdb9e98](https://www.github.com/cheminfo/nmrium/commit/cdb9e987ab12de0084e8040ca40a89ba84bf6624))
* Add new tool to draw exclusion zones ([1d48ebd](https://www.github.com/cheminfo/nmrium/commit/1d48ebdd425ef9a97b3dc2d28225f3fba1b2e859))
* add the base for Multiple spectra filter. ([39cf861](https://www.github.com/cheminfo/nmrium/commit/39cf861610a29931bb4040b32b22eaee5123ef4c))
* Advanced save in .nmrium data ([e59700b](https://www.github.com/cheminfo/nmrium/commit/e59700bb60fedd3546c72a5af0956664a0b00bd5))
* auto peak picking based on window zoom ([b7592b3](https://www.github.com/cheminfo/nmrium/commit/b7592b34efbf20caa239ea6e233b0441a730a480))
* auto ranges detection based on window zoom ([792ea3f](https://www.github.com/cheminfo/nmrium/commit/792ea3fdccc10152f064a2385f0754b38151e108))
* auto zone detection within zoom region ([#975](https://www.github.com/cheminfo/nmrium/issues/975)) ([f0452d4](https://www.github.com/cheminfo/nmrium/commit/f0452d493b74eacd07cd8f509086376e0e3338aa))
* avoid from > to in manual zone selection ([#978](https://www.github.com/cheminfo/nmrium/issues/978)) ([326ed14](https://www.github.com/cheminfo/nmrium/commit/326ed1452904d95d09f7a26adab71cce1d8285c6))
* change default color order ([7b95026](https://www.github.com/cheminfo/nmrium/commit/7b950263395370342fa7b2a6a33695db143b8f52))
* enable nmrium to load zip files with bruker folder and others ([#1024](https://www.github.com/cheminfo/nmrium/issues/1024)) ([0aa42b1](https://www.github.com/cheminfo/nmrium/commit/0aa42b1d492f518f77c944f64585899ab00cee60))
* fix wrong step size calculation-getSubMatrix ([e1e6ef0](https://www.github.com/cheminfo/nmrium/commit/e1e6ef08c58b6f0d98912e7747947faf6e15498b)), closes [#616](https://www.github.com/cheminfo/nmrium/issues/616) [#642](https://www.github.com/cheminfo/nmrium/issues/642) [#785](https://www.github.com/cheminfo/nmrium/issues/785) [#620](https://www.github.com/cheminfo/nmrium/issues/620)
* importation and exportation of nmredata ([#989](https://www.github.com/cheminfo/nmrium/issues/989)) ([7ae8c8c](https://www.github.com/cheminfo/nmrium/commit/7ae8c8cddce061023328c84224c728f2c1cabcb8))
* **nmredata:** refactor of importation/exportation ([#1007](https://www.github.com/cheminfo/nmrium/issues/1007)) ([3f539e0](https://www.github.com/cheminfo/nmrium/commit/3f539e08952bf6ab0406e6edc71ffc48096e8fa4))
* use refactored nmr-correlation package ([#1025](https://www.github.com/cheminfo/nmrium/issues/1025)) ([990eb54](https://www.github.com/cheminfo/nmrium/commit/990eb54b96130a740b26bd4a12104ba5abddfcf8))


### Bug Fixes

* " delete all " not delete all spectra. ([54907de](https://www.github.com/cheminfo/nmrium/commit/54907dec21890b74cb7eaee849c13571f8d5388e)), closes [#1028](https://www.github.com/cheminfo/nmrium/issues/1028)
* 1D and 2D histograms ([8211ff2](https://www.github.com/cheminfo/nmrium/commit/8211ff21026f6444676963c5b76d9f8a0501577a))
* avoid out-of-range indexes in zone detection ([984f297](https://www.github.com/cheminfo/nmrium/commit/984f297f7ad577f4a36909a3121ab05e58c7f66f))
* correctly build for CDN ([86dcce3](https://www.github.com/cheminfo/nmrium/commit/86dcce3a7b705df1d55d80a98429394a30385195))
* crash when select a filter. ([df6e2ba](https://www.github.com/cheminfo/nmrium/commit/df6e2baeced0caa0fd33283d8372cc1c0cde76fc))
* default color for noesy / roesy ([ccd7f9a](https://www.github.com/cheminfo/nmrium/commit/ccd7f9aa368691f7ea01a3f500bd1cb0862069a5))
* fromTo Filter ([aa8ccbc](https://www.github.com/cheminfo/nmrium/commit/aa8ccbc3961e083813df1150924c1a07c55f91fc))
* improve chart ([1695bda](https://www.github.com/cheminfo/nmrium/commit/1695bda0972bd6040393380f9a19cbc6667da33d))
* modal come over the table header, context menu not clickable. ([aac0944](https://www.github.com/cheminfo/nmrium/commit/aac094449a1ec9573a0f65f11301db4071394a39))
* Peak picking add repeatitive CSS in the DOM. ([40a5398](https://www.github.com/cheminfo/nmrium/commit/40a539894fb5929d2184d236de8bd66fd71cb5c8)), closes [#1009](https://www.github.com/cheminfo/nmrium/issues/1009)
* Peaks not align vertically in stack mode ([8d2bf59](https://www.github.com/cheminfo/nmrium/commit/8d2bf59f81024121c2c93a88886e955b915bbdf5)), closes [#1026](https://www.github.com/cheminfo/nmrium/issues/1026)
* peaks pointer vertical alignment in stack mode ([ac4fa8e](https://www.github.com/cheminfo/nmrium/commit/ac4fa8e0cba16ae52cb04e4777053df963826b02))
* prevent duplication in auto peaks detection. ([7bead8d](https://www.github.com/cheminfo/nmrium/commit/7bead8dbbbe94f2092c6e35e33998794115e6ba1))
* prevent duplication in auto ranges detection. ([2ca4a3a](https://www.github.com/cheminfo/nmrium/commit/2ca4a3aef6ca432d539312870ebe69875027dcee))
* prevent duplication in auto zones detection. ([1b13e26](https://www.github.com/cheminfo/nmrium/commit/1b13e262cbc10ed67a4f24ba3abadd60447596a8)), closes [#976](https://www.github.com/cheminfo/nmrium/issues/976)
* processed 13C example to deal with new peak format ([9dff439](https://www.github.com/cheminfo/nmrium/commit/9dff4391b5546ed6ca64f42ef301c5bdf37eb5e4))
* processed13C example and peak picking ([bad982f](https://www.github.com/cheminfo/nmrium/commit/bad982fe1701d1a39b98fdbec7d805badffd8930))
* Select component onChange event not firing on firefox ([f05e6d2](https://www.github.com/cheminfo/nmrium/commit/f05e6d2ac774620790327fa4852233db6ef98e3b)), closes [#991](https://www.github.com/cheminfo/nmrium/issues/991)
* update dependencies ([bd4e4e5](https://www.github.com/cheminfo/nmrium/commit/bd4e4e54aa4af97f83fe8184326ec1e70568298b))
* update nmr-parser / jcamp converter ([bd6d870](https://www.github.com/cheminfo/nmrium/commit/bd6d870e2223223f1cf46f960b045c100dfbbb80))
* use react-shadow to avoid being affected by external style ([fd7b803](https://www.github.com/cheminfo/nmrium/commit/fd7b803a4a567797caf258c2fee1210655f4fd00))

## [0.11.0](https://www.github.com/cheminfo/nmrium/compare/v0.10.0...v0.11.0) (2021-04-12)


### Features

* add prop to define the message on NMRium ([#967](https://www.github.com/cheminfo/nmrium/issues/967)) ([22db9ce](https://www.github.com/cheminfo/nmrium/commit/22db9ce6edaf4529fc563b107c9830d7b1d25b4f)), closes [#951](https://www.github.com/cheminfo/nmrium/issues/951)
* export and import NMRIUM file as ZIP. ([7bf6f44](https://www.github.com/cheminfo/nmrium/commit/7bf6f44b39122060b202a24030e2d3607f7c755d))
* export to nmredata ([#969](https://www.github.com/cheminfo/nmrium/issues/969)) ([c06e5ac](https://www.github.com/cheminfo/nmrium/commit/c06e5acfd19ec5c3c8e23a6ee3ee84e35c41650a))
* fix prefix of the path to jcamp file in nmredata exportation ([64b329a](https://www.github.com/cheminfo/nmrium/commit/64b329afcbdba237e7fd0d1f85dd87de66a6f0b6))


### Bug Fixes

* Keep table header fixed. ([cae5d0c](https://www.github.com/cheminfo/nmrium/commit/cae5d0c07086b0fde616e8d0798ebfb522ff19a5))
* **metadata:** export molfile without implicit hydrogens ([5b6f3cd](https://www.github.com/cheminfo/nmrium/commit/5b6f3cde97db43dd0d80db200ed69bb468565b43))
* Modals should not open outside of the component ([e599f8d](https://www.github.com/cheminfo/nmrium/commit/e599f8d7cbf896aa80b6c0f8083390997a616f01))

## [0.10.0](https://www.github.com/cheminfo/nmrium/compare/v0.9.0...v0.10.0) (2021-04-05)


### Features

* add getSpinner prop for custom loading spinner ([20a5137](https://www.github.com/cheminfo/nmrium/commit/20a51371b083f11f5128c352666a8c49666a8fa9))
* add links highlight in predicted 1H spectra ([c256fcf](https://www.github.com/cheminfo/nmrium/commit/c256fcf62159bbef05c10f9f91e2287aea3349f4))
* increase version to 0.9.0 ([9ea9758](https://www.github.com/cheminfo/nmrium/commit/9ea97585dbf4f78766fa1618f271ff15aa816774))


### Bug Fixes

* add padding to NoData element ([7505da7](https://www.github.com/cheminfo/nmrium/commit/7505da7153b3124c6d765c906bc847c4d0c28198))
* link in readme ([3513dab](https://www.github.com/cheminfo/nmrium/commit/3513dabde8a51e551fd02540429aa1eff154b56f))
* make display properties optional ([f9ca9e1](https://www.github.com/cheminfo/nmrium/commit/f9ca9e1972e2fa73e10da91ffbdd3079c74169ca))
