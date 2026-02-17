# Changelog

## [1.12.0](https://github.com/cheminfo/nmrium/compare/v1.11.0...v1.12.0) (2026-02-17)


### Features

* add "n" shortcut and tooltip for inset tool ([a6378a5](https://github.com/cheminfo/nmrium/commit/a6378a5adbac161739825268b8233ef6947bf842))
* add a tooltip in custom labels ([d523a3b](https://github.com/cheminfo/nmrium/commit/d523a3bcd0206b350279f29050271d9afd58c757))
* add export tab to settings dialog ([#3976](https://github.com/cheminfo/nmrium/issues/3976)) ([d3dba78](https://github.com/cheminfo/nmrium/commit/d3dba78a387174d0d5cd54857d414e76812d2de0))
* add general tab & header on general settings ([#3975](https://github.com/cheminfo/nmrium/issues/3975)) ([acd4353](https://github.com/cheminfo/nmrium/commit/acd435369eefdcda34f907fb85196066d8ca1ea6))
* add import filters tab ([#3977](https://github.com/cheminfo/nmrium/issues/3977)) ([0ccf9ab](https://github.com/cheminfo/nmrium/commit/0ccf9ab674a0f19489950e17af50f3de0c3c189d))
* add nuclei tab on general settings ([#3978](https://github.com/cheminfo/nmrium/issues/3978)) ([cf1cb06](https://github.com/cheminfo/nmrium/commit/cf1cb062d73f00d1a16606971d6aaa7775a976b9))
* collapse toolbar when panel header overflows ([bdf619e](https://github.com/cheminfo/nmrium/commit/bdf619e97948847a2a4c89d6b75824be9882e934))
* create base of the new general settings form ([#3957](https://github.com/cheminfo/nmrium/issues/3957)) ([e879a80](https://github.com/cheminfo/nmrium/commit/e879a8060835bea7df2a887c8cc59ef2e1b5dd05))
* implement panels tab ([#3979](https://github.com/cheminfo/nmrium/issues/3979)) ([07e7fe4](https://github.com/cheminfo/nmrium/commit/07e7fe498d3979bf7c76c3c3b4f73b264e2ebe11))
* improve information panel header ([c95d83a](https://github.com/cheminfo/nmrium/commit/c95d83a879f0d48be235387ad4a1848215a57630))
* **ranges:** forward options to publication string renderer ([#3958](https://github.com/cheminfo/nmrium/issues/3958)) ([14b4929](https://github.com/cheminfo/nmrium/commit/14b49290a82d9b5ce7c8e82774031c5d80efec55))
* show 1D assign actions in 2D directly next to the cursor ([cae8872](https://github.com/cheminfo/nmrium/commit/cae8872cf452029aed827a4070e192c202293693)), closes [#3941](https://github.com/cheminfo/nmrium/issues/3941)
* take into account publication string feedbacks ([#3966](https://github.com/cheminfo/nmrium/issues/3966)) ([94407c6](https://github.com/cheminfo/nmrium/commit/94407c69baf18f31d174e12fff45a92e158571a6))


### Bug Fixes

* do not always render experimental settings dialog ([#3986](https://github.com/cheminfo/nmrium/issues/3986)) ([0bdbe8d](https://github.com/cheminfo/nmrium/commit/0bdbe8d4dbb2e8ef19a117e5be0a5f4dffea4507))
* double click to collapse panels ([b02bf61](https://github.com/cheminfo/nmrium/commit/b02bf61cca398cca3b6ac9105bafc2ab861f5fd3))
* general settings save / apply ([#3982](https://github.com/cheminfo/nmrium/issues/3982)) ([630c7f3](https://github.com/cheminfo/nmrium/commit/630c7f35bf8e21233e69a27b12a6fef946a246f4))
* make ACS options object optional ([#3984](https://github.com/cheminfo/nmrium/issues/3984)) ([b9f32cb](https://github.com/cheminfo/nmrium/commit/b9f32cba61d1f80b5417d4456efe583b963c662b))
* **ranges:** publication string preview iso with chart ([14b4929](https://github.com/cheminfo/nmrium/commit/14b49290a82d9b5ce7c8e82774031c5d80efec55))
* reset activeSpectra and selectReferences state before load ([2f2de1f](https://github.com/cheminfo/nmrium/commit/2f2de1f6c2fe2f135fe8ef4ab6c5f1b5fabc53b2))
* update dependencies ([#3981](https://github.com/cheminfo/nmrium/issues/3981)) ([51ecec3](https://github.com/cheminfo/nmrium/commit/51ecec3ca7a18b98a5e3edd0fae0c7b4da349f50))

## [1.11.0](https://github.com/cheminfo/nmrium/compare/v1.10.1...v1.11.0) (2026-01-27)


### Features

* add automatic atom labeling ([#3909](https://github.com/cheminfo/nmrium/issues/3909)) ([8970902](https://github.com/cheminfo/nmrium/commit/897090232a5717e45f911ec7d1a75b44f9fdb664)), closes [#3908](https://github.com/cheminfo/nmrium/issues/3908)
* check nmrium archive by header instead extension ([#3888](https://github.com/cheminfo/nmrium/issues/3888)) ([4774219](https://github.com/cheminfo/nmrium/commit/47742190b580ab1a5fd1fbe61c4daffd8d3049fe))
* cut spectra analysis ([b46a58a](https://github.com/cheminfo/nmrium/commit/b46a58a7abc5189094289be3d566a66f4d1bea37))
* save to NMRium Archive v1 format ([#3915](https://github.com/cheminfo/nmrium/issues/3915)) ([eb2cf49](https://github.com/cheminfo/nmrium/commit/eb2cf4954ec42ab71208896bf26c0156fc92a37b))
* support exporting Molfile V2 and V3 ([c14ea8c](https://github.com/cheminfo/nmrium/commit/c14ea8cb72081af064bc5ffce3feb36ed54f7fad)), closes [#3904](https://github.com/cheminfo/nmrium/issues/3904)


### Bug Fixes

* avoid use `.nmrium` as file source ([#3898](https://github.com/cheminfo/nmrium/issues/3898)) ([ab24c70](https://github.com/cheminfo/nmrium/commit/ab24c7009aad4aa08e0ddba8e31e16ceab53debd))
* do not calculate contours when the length of z is less than 0 ([fdbf3f2](https://github.com/cheminfo/nmrium/commit/fdbf3f26cd5564ae275f0d93bb61b3042b068b09))
* don't throw on missing molecules ([eb2cf49](https://github.com/cheminfo/nmrium/commit/eb2cf4954ec42ab71208896bf26c0156fc92a37b))
* ignore molecule modal double-click from label edit form ([0c42085](https://github.com/cheminfo/nmrium/commit/0c4208569e56771864760fb8324e436b1eae12cc)), closes [#3894](https://github.com/cheminfo/nmrium/issues/3894)
* make spectra selection on sorted spectra order ([ee43689](https://github.com/cheminfo/nmrium/commit/ee4368977fa7d16f89ca9771c48e575eea4741b1)), closes [#3903](https://github.com/cheminfo/nmrium/issues/3903)
* render structure with correct coordinates ([8970902](https://github.com/cheminfo/nmrium/commit/897090232a5717e45f911ec7d1a75b44f9fdb664))
* reorder draggable components in DOM and set custom label edit popup z-index to 1 ([38e80f1](https://github.com/cheminfo/nmrium/commit/38e80f1ec71f7488cce5d85f3bfe7befe33b50ba))
* resolve NextPrev slider width measurement in modals ([9eeab1f](https://github.com/cheminfo/nmrium/commit/9eeab1f394553d1ce8d4f9dfbc6aaa600ba07ae8))
* set a safe min contour level to avoid crashes ([#3926](https://github.com/cheminfo/nmrium/issues/3926)) ([e1d427f](https://github.com/cheminfo/nmrium/commit/e1d427f1883b5180fe71e8c42c2f34ddde9c3f4c))
* sync assignment labels ([6703d54](https://github.com/cheminfo/nmrium/commit/6703d5404b2990b9c08744d4034fababb0922ac7))

## [1.10.1](https://github.com/cheminfo/nmrium/compare/v1.10.0...v1.10.1) (2025-12-12)


### Bug Fixes

* display molecule when no active tab ([bc903f7](https://github.com/cheminfo/nmrium/commit/bc903f77a5fbc35b0a52d6fb5c7d48781d62c301))

## [1.10.0](https://github.com/cheminfo/nmrium/compare/v1.9.0...v1.10.0) (2025-12-11)


### Features

* improve ium integration ([#3881](https://github.com/cheminfo/nmrium/issues/3881)) ([42fbc5f](https://github.com/cheminfo/nmrium/commit/42fbc5f6dfa4bea5446557f646ee466dc8b49ee8))
* improving and simplifying the 1D assignment ([#3835](https://github.com/cheminfo/nmrium/issues/3835)) ([9f724fd](https://github.com/cheminfo/nmrium/commit/9f724fdbe138447b88d8157d7501c2cb5292acd1))
* migrate form to tanstack & zod ([#3810](https://github.com/cheminfo/nmrium/issues/3810)) ([89bad18](https://github.com/cheminfo/nmrium/commit/89bad1820c1d08ab70411bd8c37a5a84e134d8e6))


### Bug Fixes

* check that a spectrum is selected and it is 1D before the range cut ([b641b4f](https://github.com/cheminfo/nmrium/commit/b641b4faa7ede11d3e99cf2517419ea73b5dd8ff))
* clear assignments associated with selected molecule atoms ([#3851](https://github.com/cheminfo/nmrium/issues/3851)) ([20fa63b](https://github.com/cheminfo/nmrium/commit/20fa63bad33b78fe4b0ebc74202f7ad6d4d8c3bc))
* correct rendering of 1D traces over the 2D ([#3870](https://github.com/cheminfo/nmrium/issues/3870)) ([a6098c8](https://github.com/cheminfo/nmrium/commit/a6098c8a43b8f8f45790267c31e7b8a955b585b2))
* do not emit unhandled rejection in clipboard reads ([#3853](https://github.com/cheminfo/nmrium/issues/3853)) ([1c2151d](https://github.com/cheminfo/nmrium/commit/1c2151d1a319867d9d9bef9a3e13f110c6f402a3))
* filter temp data handling ([ce669ce](https://github.com/cheminfo/nmrium/commit/ce669ceab61d6e5eb53b68270daab83c1489c78a))
* improve zone detection typings ([#3871](https://github.com/cheminfo/nmrium/issues/3871)) ([a774e68](https://github.com/cheminfo/nmrium/commit/a774e68d4343429b40e21ed6aa5c83e07d0bedbe))
* keep an even number of rows when the acquisition is incomplete ([#3882](https://github.com/cheminfo/nmrium/issues/3882)) ([e865067](https://github.com/cheminfo/nmrium/commit/e865067245a806dca3e86cd14266822a997752fb))
* prevent zone tool from activating on 1D traces ([c1d1df9](https://github.com/cheminfo/nmrium/commit/c1d1df9e2811795a189be1ce3e667667ca4c6fdb))
* remove use of `any` in 1D components and brush tracker ([e25d653](https://github.com/cheminfo/nmrium/commit/e25d653251fce36b7eecf4ec64e9630d298b076e))
* remove use of `any` in 2D components ([c3f777a](https://github.com/cheminfo/nmrium/commit/c3f777a0b429968fcb2c3d7433b1a870cfec6b73))
* render peak edition above annotations ([c114785](https://github.com/cheminfo/nmrium/commit/c1147851e1e0f8a8472e655f2e187f483b63a4f6))
* reset current workspace after removing the active workspace ([9c038f0](https://github.com/cheminfo/nmrium/commit/9c038f09a50f172ba8aa5e8d5dedb9a70c95eb61))
* simplify handling of active spectrum, better checks, improve types ([#3862](https://github.com/cheminfo/nmrium/issues/3862)) ([e00b30b](https://github.com/cheminfo/nmrium/commit/e00b30b78b5cfb48283e7c11f85657f6b39c54c0))
* update the mol locally in prediction panel on load ([#3860](https://github.com/cheminfo/nmrium/issues/3860)) ([4830a0d](https://github.com/cheminfo/nmrium/commit/4830a0d53d40d0de5f0b5b66c62fa6d7966b1eda))

## [1.9.0](https://github.com/cheminfo/nmrium/compare/v1.8.0...v1.9.0) (2025-11-25)


### Features

* add more custom info for resurrected spectrum from database ([b291c7b](https://github.com/cheminfo/nmrium/commit/b291c7bc0ef2f6cad2bde2dc8dd5d04a7fbd8b72)), closes [#3827](https://github.com/cheminfo/nmrium/issues/3827)
* display the information related to a database entry ([376033a](https://github.com/cheminfo/nmrium/commit/376033a475579b378fe629649e82952d3d0445e5)), closes [#3828](https://github.com/cheminfo/nmrium/issues/3828)
* flatten custom info object when resurrecting spectrum from the database ([01b9ee2](https://github.com/cheminfo/nmrium/commit/01b9ee2b9f8cf5761be5f8d8ebfdf2f9ce8bebf8)), closes [#3826](https://github.com/cheminfo/nmrium/issues/3826)
* improve multiple spectra integration tooltip ([1cc2752](https://github.com/cheminfo/nmrium/commit/1cc2752fede35976857cc79950e8404da2c1812c)), closes [#3840](https://github.com/cheminfo/nmrium/issues/3840)


### Bug Fixes

* increase the J max value for multiplet analysis ([#3837](https://github.com/cheminfo/nmrium/issues/3837)) ([abc8cb4](https://github.com/cheminfo/nmrium/commit/abc8cb4b75d895968d7796db905ae7112ccf5c7f))
* return empty array when active spectra nuclei are not defined ([a919e45](https://github.com/cheminfo/nmrium/commit/a919e45546cbc9047a3edb43781f7489e884e22f))
* validate parse smiles/molfile ([#3850](https://github.com/cheminfo/nmrium/issues/3850)) ([479de38](https://github.com/cheminfo/nmrium/commit/479de38d8ec9cdbd3a63a44675e866dbd3394a8a))

## [1.8.0](https://github.com/cheminfo/nmrium/compare/v1.7.0...v1.8.0) (2025-11-19)


### Features

* adapt to flat nmrium archive structure ([#3811](https://github.com/cheminfo/nmrium/issues/3811)) ([fb978cd](https://github.com/cheminfo/nmrium/commit/fb978cd83a0f9299f13737cfcf4eb0427d5b46e7))
* assign range assignment label from atom custom label ([#3820](https://github.com/cheminfo/nmrium/issues/3820)) ([13c5554](https://github.com/cheminfo/nmrium/commit/13c55540fa33c2677d627eba83b9d3d43198aea9))
* clear molecule custom atom labels ([940d434](https://github.com/cheminfo/nmrium/commit/940d434429c1620875958c9733c73286051bc0d4))
* improve molecule view options ([#3800](https://github.com/cheminfo/nmrium/issues/3800)) ([444ec94](https://github.com/cheminfo/nmrium/commit/444ec94d25f453179431d3064788c6bc8ce114b4))


### Bug Fixes

* add missing 1D and 2D tools to general and workspace settings ([87adaa5](https://github.com/cheminfo/nmrium/commit/87adaa549fd7642492e017605e3336bfd7d7b89d))
* assign heavy atoms correctly ([7b522b3](https://github.com/cheminfo/nmrium/commit/7b522b31d2748a0db951e67f68eef37ebd13ae49))
* improve peak picking in ranges ([d6f35ef](https://github.com/cheminfo/nmrium/commit/d6f35efad86a94df56084085719505807e5be1be))
* prevent 'space' key from triggering other focused elements   ([#3830](https://github.com/cheminfo/nmrium/issues/3830)) ([0281885](https://github.com/cheminfo/nmrium/commit/028188504f8b251331f2afc83280d698048e6784))
* show/hide customs label over floating molecule ([5a299e2](https://github.com/cheminfo/nmrium/commit/5a299e24683670f37078d197e214715f18762b14))

## [1.7.0](https://github.com/cheminfo/nmrium/compare/v1.6.1...v1.7.0) (2025-10-31)


### Features

* add more signal kinds ([#3782](https://github.com/cheminfo/nmrium/issues/3782)) ([f282586](https://github.com/cheminfo/nmrium/commit/f2825863e07b0ac0e6f0392e44ba214f7fe3eede))
* copy DB meta information to customInfo ([2fafb02](https://github.com/cheminfo/nmrium/commit/2fafb029c88b00963331fb9b6ab01a7b582f5bb1))
* dim non-signal elements (peaks and integrals) ([502f854](https://github.com/cheminfo/nmrium/commit/502f854fa3295d5bd57206da042ea9ebd8108462)), closes [#3795](https://github.com/cheminfo/nmrium/issues/3795)
* display 2D Y-axis unit label ([6b9286c](https://github.com/cheminfo/nmrium/commit/6b9286c540dcd2dfe50ecc094b53ca5d7cbdf472)), closes [#3712](https://github.com/cheminfo/nmrium/issues/3712)
* hide C if custom labels and atom is a carbon ([466a5f1](https://github.com/cheminfo/nmrium/commit/466a5f1da75137adcd335dec72d507d89d3eeb0b))
* support experimental nmrium archive file format ([#3733](https://github.com/cheminfo/nmrium/issues/3733)) ([2c33f81](https://github.com/cheminfo/nmrium/commit/2c33f81e5f0f4880c65691e5e3d00d5cd22492d3))


### Bug Fixes

* assign traces in 2d ([#3777](https://github.com/cheminfo/nmrium/issues/3777)) ([5fdb708](https://github.com/cheminfo/nmrium/commit/5fdb708bfec09112160dde751b00729e9d67394c))
* auto ranges picking pass the number of protons as integrationsum if the molecule exists. ([a842b08](https://github.com/cheminfo/nmrium/commit/a842b083fb536dc4114c14381187b4cb7f5b12b1))
* **auto-processing:** correct handling of sine bell (SSB) parameter in Bruker format ([#3750](https://github.com/cheminfo/nmrium/issues/3750)) ([2657985](https://github.com/cheminfo/nmrium/commit/2657985ae436932b5d8e6e82daa68ccd2b52310e))
* correct highlighting of assigned 1D ranges ([576f30d](https://github.com/cheminfo/nmrium/commit/576f30da88c03913151e53a03568b90db76d78a5)), closes [#3788](https://github.com/cheminfo/nmrium/issues/3788)
* correctly position multiplicity tree in stack mode ([6d21b89](https://github.com/cheminfo/nmrium/commit/6d21b8907e8e422d4ae14dd5ed58fd3a33a60ab4)), closes [#3779](https://github.com/cheminfo/nmrium/issues/3779)
* multiple call to `readNMRiumObject` into `NMRiumStateProvider` ([#3790](https://github.com/cheminfo/nmrium/issues/3790)) ([e8823b8](https://github.com/cheminfo/nmrium/commit/e8823b8236857e5ac7c72164f633aa556dbdabc5))
* property of structures in DB is ocl and not oclid ([084bbae](https://github.com/cheminfo/nmrium/commit/084bbaeddadcabc4c55380487009199e5d8c1fa8))
* put correct extension for `.tsv`, `.svg` and `.png` ([#3793](https://github.com/cheminfo/nmrium/issues/3793)) ([b03dd45](https://github.com/cheminfo/nmrium/commit/b03dd453864bc1bdca8c0767d5a356d7358ddd0e))
* remove explicit URL validations ([0321238](https://github.com/cheminfo/nmrium/commit/0321238806ad2e807a8f83c282345d7c6a10d5cb))
* rollback spectrum before reapplying shift in 2D ([25cf896](https://github.com/cheminfo/nmrium/commit/25cf896652555e295e4c490f2c20343646f338a2)), closes [#3785](https://github.com/cheminfo/nmrium/issues/3785)

## [1.6.1](https://github.com/cheminfo/nmrium/compare/v1.6.0...v1.6.1) (2025-10-16)


### Bug Fixes

* only suppress solvent for 13C ([#3766](https://github.com/cheminfo/nmrium/issues/3766)) ([38dda06](https://github.com/cheminfo/nmrium/commit/38dda065b3ecf6cc2aa6cfb809b1a59845495da4))

## [1.6.0](https://github.com/cheminfo/nmrium/compare/v1.5.0...v1.6.0) (2025-10-14)


### Features

* carbon solvent labelling ([#3693](https://github.com/cheminfo/nmrium/issues/3693)) ([720722b](https://github.com/cheminfo/nmrium/commit/720722bedbf7d4a79aee2a8499b2615991a5bc85))


### Bug Fixes

* use package wrapper for native ESM support in pdnd ([#3756](https://github.com/cheminfo/nmrium/issues/3756)) ([de0fabf](https://github.com/cheminfo/nmrium/commit/de0fabf845814f428ffe3885ca7470315297fa85))

## [1.5.0](https://github.com/cheminfo/nmrium/compare/v1.4.0...v1.5.0) (2025-10-12)


### Features

* hide labels of overlapping peaks ([402c832](https://github.com/cheminfo/nmrium/commit/402c832688c94b539b8c5055d160a4ab648954c1))
* improve peaks overlap detection ([402c832](https://github.com/cheminfo/nmrium/commit/402c832688c94b539b8c5055d160a4ab648954c1))
* show integrals by default only for 1H spectra ([ab4a1d3](https://github.com/cheminfo/nmrium/commit/ab4a1d3602209c8fbdb6da726347db7a710b98e6)), closes [#3739](https://github.com/cheminfo/nmrium/issues/3739)
* show peaks by default only for carbon spectra ([d6e7617](https://github.com/cheminfo/nmrium/commit/d6e7617fdba2ff34b3eab3ce311cf741f6f6370e))


### Bug Fixes

* correctly assign and highlight homoNuclear nuclei ([5ccecde](https://github.com/cheminfo/nmrium/commit/5ccecde3ab31b2a59e9fcbf9dba277b92d0c9baf)), closes [#3738](https://github.com/cheminfo/nmrium/issues/3738)

## [1.4.0](https://github.com/cheminfo/nmrium/compare/v1.3.0...v1.4.0) (2025-10-09)


### Features

* add yellow highlight to assigned 2D signals ([c39c27b](https://github.com/cheminfo/nmrium/commit/c39c27bd55d5498f6c7046665d4a475ad08d511e)), closes [#3718](https://github.com/cheminfo/nmrium/issues/3718)
* CT exports with alias atoms ([e777d01](https://github.com/cheminfo/nmrium/commit/e777d017d90fae940d96f8b385aacf1cd7c15a96))
* improve export publication string options ([#3677](https://github.com/cheminfo/nmrium/issues/3677)) ([8f134c5](https://github.com/cheminfo/nmrium/commit/8f134c58e793a46221a76e7351c2ec0055ebb93b))
* position the ranges assignment popup near the cursor ([fcd2015](https://github.com/cheminfo/nmrium/commit/fcd2015712e9232e338896c54064cdc791e6c099))


### Bug Fixes

* clear structure query should reset hexagon icon state ([e916fec](https://github.com/cheminfo/nmrium/commit/e916fec3a6db0db7a9aefb80e1e1bf5a6a255e5b))
* correctly assign both x and y axes in 2D ([76fdc89](https://github.com/cheminfo/nmrium/commit/76fdc89131c980f18fbb904642e9934a5ca5eb7a))
* correctly position zone assignment popup ([ce43d72](https://github.com/cheminfo/nmrium/commit/ce43d723835eac5d2e661c2ea5ba656452626423))
* debounce and set peak picking minMaxRatio default to 0.01 ([1a454e5](https://github.com/cheminfo/nmrium/commit/1a454e5ffb144e92c1ded8f4cd188e113551f2e1))
* only render dialog contents styles with fallback ([#3746](https://github.com/cheminfo/nmrium/issues/3746)) ([df969c6](https://github.com/cheminfo/nmrium/commit/df969c608c3671c3978e5ad820692d16a63dd2e0))
* prevent duplicate entries in export and import menus ([a9ddcfc](https://github.com/cheminfo/nmrium/commit/a9ddcfc6e652e605e1d4c5e3e93a596b8d25688b)), closes [#3715](https://github.com/cheminfo/nmrium/issues/3715)
* recalculate ranges integrations when sum changes ([97a1387](https://github.com/cheminfo/nmrium/commit/97a1387ac281af9c995ebbff135d7e034f9f5ab7))
* revert auto peak-picking threshold to 0.05 ([#3747](https://github.com/cheminfo/nmrium/issues/3747)) ([3aca81e](https://github.com/cheminfo/nmrium/commit/3aca81edda93df64bec36b50d25e989a05d5c52f))

## [1.3.0](https://github.com/cheminfo/nmrium/compare/v1.2.1...v1.3.0) (2025-09-02)


### Features

* **slot:** support `topbar.about_us.modal` slot with fallback ([#3676](https://github.com/cheminfo/nmrium/issues/3676)) ([80562a3](https://github.com/cheminfo/nmrium/commit/80562a3f7b239dfe00c6fb0088bbdba90bbdca09))
* support custom label edition on atom ([#3668](https://github.com/cheminfo/nmrium/issues/3668)) ([04e5ff7](https://github.com/cheminfo/nmrium/commit/04e5ff7cf15afbdf73faf280ec81d2871c4965a0))


### Bug Fixes

* add missing 'nbPoints' property to simulated spectrum ([#3630](https://github.com/cheminfo/nmrium/issues/3630)) ([60c6686](https://github.com/cheminfo/nmrium/commit/60c6686c426d921b94218cc1e8df91740a68d0f5))
* display FFT second dimension after applying first dimension ([74f1947](https://github.com/cheminfo/nmrium/commit/74f194769855b5c9e8eb11fa7f642aad1853a0cb))
* prevent adding molecule when molfile is corrupted ([33508e2](https://github.com/cheminfo/nmrium/commit/33508e273ca4e11e9374da4d6d6eb83eb4333a36))
* prevent domain refresh when selecting Ft spectra ([b22e25c](https://github.com/cheminfo/nmrium/commit/b22e25c47f99cdcacb9c4f854d569015b8e7af0e))
* support exporting floating molecules as SVG ([a647599](https://github.com/cheminfo/nmrium/commit/a647599aa7cd3ede59f1881b73bee77cba7f162a))
* use selector for ReactRnd bounds ([ac0f511](https://github.com/cheminfo/nmrium/commit/ac0f51113f4755b1446fb062cd05fb6f18a5911a)), closes [#3669](https://github.com/cheminfo/nmrium/issues/3669)

## [1.2.1](https://github.com/cheminfo/nmrium/compare/v1.2.0...v1.2.1) (2025-08-27)


### Bug Fixes

* add '.zip' extension when exporting CT files ([b334685](https://github.com/cheminfo/nmrium/commit/b33468568ce2679759cb0af070f4e89971a13bdb))
* correctly show fully processed live preview for apodization filter ([08651f6](https://github.com/cheminfo/nmrium/commit/08651f6709ab6df290f71e590c33dace9ecb16b8))
* disable editing of read-only filters ([4808d0d](https://github.com/cheminfo/nmrium/commit/4808d0d6b7fdf3324331ebacf32de7d5e53b4144))
* make printing use the same handling logic as export ([0545c33](https://github.com/cheminfo/nmrium/commit/0545c33cd48fe4c907b658683089d5eb2e627da3))
* mark exclusion zones data as dirty to allow changes to be applied ([52bfafc](https://github.com/cheminfo/nmrium/commit/52bfafc6f974ecf18b34e98b8873e2b1b0f4daaa))
* rollback to full processed spectrum when cancelling filter edit ([3499ea3](https://github.com/cheminfo/nmrium/commit/3499ea32a31f492305098b5ac46d1dc995636559)), closes [#3654](https://github.com/cheminfo/nmrium/issues/3654)

## [1.2.0](https://github.com/cheminfo/nmrium/compare/v1.1.0...v1.2.0) (2025-08-21)


### Features

* support filter insertion after spectrum rollback ([1dd1f9e](https://github.com/cheminfo/nmrium/commit/1dd1f9e26c26baf59b9a12647390e4e2f5daafe6))


### Bug Fixes

* display feedback message when JSON export fails ([a5261af](https://github.com/cheminfo/nmrium/commit/a5261af9f895027e827fe13b69de9d6ae18db756))
* exports mapping and update dependencies ([#3634](https://github.com/cheminfo/nmrium/issues/3634)) ([2a20938](https://github.com/cheminfo/nmrium/commit/2a2093830d1bfab1ebcb2cec53820ff92bba32c2))
* handle jcamp filtering correctly during NMRium file load ([5ddd5af](https://github.com/cheminfo/nmrium/commit/5ddd5af3916aad9f367299d7ccb2fdf60a7bea44))
* improve useFilter hook to safely handle empty filters ([a4b7cb8](https://github.com/cheminfo/nmrium/commit/a4b7cb87ad56370b83134a956c3164a928d37b13))
* show 'No spectra available for export' message when no exportable spectra is present ([dbf20ee](https://github.com/cheminfo/nmrium/commit/dbf20ee64e4ebba64a68741be1f9770a5f6b6dd1))

## [1.1.0](https://github.com/cheminfo/nmrium/compare/v1.0.0...v1.1.0) (2025-07-29)


### Features

* extend 2D prediction points range starting from 64 up to 4096 ([70f737f](https://github.com/cheminfo/nmrium/commit/70f737fa75e5c3435f5485db65862f9bcabe345c))
* move 2D processing from experimental to stable feature ([5df91f3](https://github.com/cheminfo/nmrium/commit/5df91f340b29c4a0b68870f6da2626c5584d2594))
* move inset tool from experimental to stable feature ([cf421fe](https://github.com/cheminfo/nmrium/commit/cf421fe86e69f936a46132a6a11e17904d1b444e))
* **plugin:** support `topbar.right` plugin ui slot ([#3621](https://github.com/cheminfo/nmrium/issues/3621)) ([c353b3f](https://github.com/cheminfo/nmrium/commit/c353b3fdf44c3bddcc8e8bbc29fe1c3abb8de03d))

## [1.0.0](https://github.com/cheminfo/nmrium/compare/v0.65.2...v1.0.0) (2025-07-24)


### ⚠ BREAKING CHANGES

* `file-collection` is now used to manage data sources

### Code Refactoring

* remove `filelist-utils` and `jszip` for better alternatives ([#3615](https://github.com/cheminfo/nmrium/issues/3615)) ([c110206](https://github.com/cheminfo/nmrium/commit/c110206d74446e0697ba67e3cba3a83f69cf765c))

## [0.65.2](https://github.com/cheminfo/nmrium/compare/v0.65.1...v0.65.2) (2025-07-15)


### Bug Fixes

* don't display publication string when there are no ranges ([2774b3b](https://github.com/cheminfo/nmrium/commit/2774b3b0501f09d692b32670cc60aecb02921019))
* prediction panel structure editor scrolls on overflow ([5c8a937](https://github.com/cheminfo/nmrium/commit/5c8a937286f6ca1109bdd66d042b2745e0cbc9b6))

## [0.65.1](https://github.com/cheminfo/nmrium/compare/v0.65.0...v0.65.1) (2025-07-10)


### Bug Fixes

* live update filters in processed mode when editing apodization ([1267b4f](https://github.com/cheminfo/nmrium/commit/1267b4fda27042616e32a23e44d24723443604fc)), closes [#3586](https://github.com/cheminfo/nmrium/issues/3586)

## [0.65.0](https://github.com/cheminfo/nmrium/compare/v0.64.0...v0.65.0) (2025-06-20)


### Features

* add 'clickTriggerMode' to support native or debounced click handling ([c7f6ef6](https://github.com/cheminfo/nmrium/commit/c7f6ef623c05729cff534c32ad58a3adab1c0cd8))
* cancel brushing on 'Escape' key press ([cedbfad](https://github.com/cheminfo/nmrium/commit/cedbfad395614b22901311302caad67c54612255))
* copy as smiles ([906c12d](https://github.com/cheminfo/nmrium/commit/906c12d1f11141d7f4c94e0e8fc4d11eb5060568))
* improve brush selection ([#3588](https://github.com/cheminfo/nmrium/issues/3588)) ([bc2faec](https://github.com/cheminfo/nmrium/commit/bc2faeca80605513d003136572fc07d959053f45))
* improve multiple spectra analysis formula calculation  ([#3590](https://github.com/cheminfo/nmrium/issues/3590)) ([b740969](https://github.com/cheminfo/nmrium/commit/b7409694758e04c6af2b49ac1fe40ff45443f13f))
* remove related insets when a spectrum is deleted ([87b20fd](https://github.com/cheminfo/nmrium/commit/87b20fd522314760a60ba618f6624fe2bf0299d0)), closes [#3552](https://github.com/cheminfo/nmrium/issues/3552)


### Bug Fixes

* align 1D spectra to the same top when loading ([#3556](https://github.com/cheminfo/nmrium/issues/3556)) ([7cd1237](https://github.com/cheminfo/nmrium/commit/7cd123708e62d2e4a4d7dabd31d1c5d32b4067fa))
* avoid large delta on first CTRL + bidirectional zoom ([7a9196d](https://github.com/cheminfo/nmrium/commit/7a9196d19ac2df796814f9535697f19005d40661))
* clone matrix options before dispatch ([#3570](https://github.com/cheminfo/nmrium/issues/3570)) ([7dcc0ef](https://github.com/cheminfo/nmrium/commit/7dcc0effec7a0c024261432b15a906b4ee299112))
* validate simulation form correctly and debounce value change ([c227474](https://github.com/cheminfo/nmrium/commit/c227474a0d5a8371816c27c084015f0e46fa6256)), closes [#3555](https://github.com/cheminfo/nmrium/issues/3555) [#3554](https://github.com/cheminfo/nmrium/issues/3554)

## [0.64.0](https://github.com/cheminfo/nmrium/compare/v0.63.2...v0.64.0) (2025-05-31)


### Features

* add basic reorder feature to sections component ([1da85c1](https://github.com/cheminfo/nmrium/commit/1da85c160e645447d3927a9826671556fba4e318))
* assign 1d from 2d ([6409e59](https://github.com/cheminfo/nmrium/commit/6409e590c4e28cf69812a3158161ecc6ea8cbf75))
* display prediction errors ([cc3a473](https://github.com/cheminfo/nmrium/commit/cc3a473cd1659dd46b7ca9906c9c2f131603c96b))
* past molfile/SMILES in prediction panel ([4bf7af7](https://github.com/cheminfo/nmrium/commit/4bf7af7b4e22e1e29568e8ca83679da3d1016c50))
* reorder filters ([284c1dc](https://github.com/cheminfo/nmrium/commit/284c1dcb32beefcf79a24e29441ba4b3a009f4b5))


### Bug Fixes

* 2d phase correction and spectrum rollback ([502b621](https://github.com/cheminfo/nmrium/commit/502b621dfe7d480a582b1d74113fa4257a402611))
* allow 250MHz simulation ([087a0c4](https://github.com/cheminfo/nmrium/commit/087a0c4a4226618db2319d9aef7ebd37b7086e6e))
* move Accordion component to controlled component ([#3520](https://github.com/cheminfo/nmrium/issues/3520)) ([e3921ee](https://github.com/cheminfo/nmrium/commit/e3921eea1839a4409fd5352044099beed8b415eb))
* new approach for determining the default contour levels in 2D ([#3542](https://github.com/cheminfo/nmrium/issues/3542)) ([3761276](https://github.com/cheminfo/nmrium/commit/37612765cde46e61da91c1f7d670b29759e16d86))
* prevent combined zoom in stack mode ([#3553](https://github.com/cheminfo/nmrium/issues/3553)) ([2c1f15c](https://github.com/cheminfo/nmrium/commit/2c1f15c61eb84130a4fa0d33e2fac77b133ef47e))
* prevent unnecessary re-renders ([ccae049](https://github.com/cheminfo/nmrium/commit/ccae049011dcff7154e64d394d04c8579c1ced28))
* reset domain when filter is cancelled ([bb327c1](https://github.com/cheminfo/nmrium/commit/bb327c1d14c323c0c989c4eedb5ed3c9c6c2aec4))
* toggle default open database ([#3547](https://github.com/cheminfo/nmrium/issues/3547)) ([d68495b](https://github.com/cheminfo/nmrium/commit/d68495bb033a8acf8df0443a33f7facafc97043c))
* use 'getBBox' function for layout in SVG ([#3559](https://github.com/cheminfo/nmrium/issues/3559)) ([547cc3e](https://github.com/cheminfo/nmrium/commit/547cc3ec9a051a70848fe463298dd47a8f04de5a))
* zoom history manager should take into account the base zoom ([23f0de5](https://github.com/cheminfo/nmrium/commit/23f0de5d3ad17b789d32cc0d892dbe8bbe381e39))

## [0.63.2](https://github.com/cheminfo/nmrium/compare/v0.63.1...v0.63.2) (2025-05-13)


### Bug Fixes

* check if a spectrum is selected before fetching assigned IDs ([242682d](https://github.com/cheminfo/nmrium/commit/242682d7bee25fa945b476122705e1832ad2ee69))

## [0.63.1](https://github.com/cheminfo/nmrium/compare/v0.63.0...v0.63.1) (2025-05-12)


### Bug Fixes

* apply inline style on assignment guide lines when export as svg ([a3968c2](https://github.com/cheminfo/nmrium/commit/a3968c254485c73a92b0e10e5f6c38f8993de102))
* generate ranges from signals instead to directly use it as range ([#3465](https://github.com/cheminfo/nmrium/issues/3465)) ([74a685e](https://github.com/cheminfo/nmrium/commit/74a685ed0859ba31fb5ac07645cdeb5ce0382a59))
* prediction panel usability ([#3511](https://github.com/cheminfo/nmrium/issues/3511)) ([9c182f6](https://github.com/cheminfo/nmrium/commit/9c182f6e4570048c1944e2959d0a6a9aa9c40884))

## [0.63.0](https://github.com/cheminfo/nmrium/compare/v0.62.1...v0.63.0) (2025-05-09)


### ⚠ BREAKING CHANGES

* It was exported by `nmr-load-save`, `@zakodium/nmrium-core` do not export this method. It is callable from instantiated core only.

### Features

* add support for inverted scroll behavior ([f2ef939](https://github.com/cheminfo/nmrium/commit/f2ef939da097f74b0431b4772a9bdb872bee56a8))
* assign 1D labels from 2D spectra ([45f931a](https://github.com/cheminfo/nmrium/commit/45f931ab135a815dfa1e0df4d8db1d56ab9ce407))
* assignments guidelines over the first and second dimensions ([f0821a3](https://github.com/cheminfo/nmrium/commit/f0821a3f5f12f61296569784bb4723981e52c246))
* bidirectional 1D zoom ([#3472](https://github.com/cheminfo/nmrium/issues/3472)) ([339c67d](https://github.com/cheminfo/nmrium/commit/339c67d5f5e362358de6aa8e315174373504eaf7))
* control structure size (default minHeight: 100px) ([e56ef9a](https://github.com/cheminfo/nmrium/commit/e56ef9abeffc7c76e9747727570aab0342bdf775))
* control structure size (default minHeight: 100px) ([d434888](https://github.com/cheminfo/nmrium/commit/d434888b55f717d50b259b5489d4a9d61af514f7))
* hide 2D phase correction for non-quadrant spectra ([b6d7c46](https://github.com/cheminfo/nmrium/commit/b6d7c461a54ddbd30060d44e1f5a02cf5cdc4b34))
* horizontal and vertical zoom with CTRL + drag ([#3469](https://github.com/cheminfo/nmrium/issues/3469)) ([f0e99b2](https://github.com/cheminfo/nmrium/commit/f0e99b22d05b0d3af6674feeb60361a2f01ea7bf))
* improve database panel ([#3455](https://github.com/cheminfo/nmrium/issues/3455)) ([#3461](https://github.com/cheminfo/nmrium/issues/3461)) ([e56ef9a](https://github.com/cheminfo/nmrium/commit/e56ef9abeffc7c76e9747727570aab0342bdf775))
* minimum width for overlay highlight range ([d4872e7](https://github.com/cheminfo/nmrium/commit/d4872e7043037cd83cae1dc93598e92d8909118e))
* processed apodization ([#3447](https://github.com/cheminfo/nmrium/issues/3447)) ([3fbbfdc](https://github.com/cheminfo/nmrium/commit/3fbbfdc3e3ce994ed30032951654ad35faec270c))
* reopen the collapsed panels area when toggling the panel from the panels bar ([3cf40ff](https://github.com/cheminfo/nmrium/commit/3cf40ffd91f3b2871d90ff543fc7b09ce6a53c5d))
* stack range assignment labels to avoid overlap ([b7fe786](https://github.com/cheminfo/nmrium/commit/b7fe7868cd310a60016319c692e87587f443f98c))
* suggest default assignment label for 2D assignment based on closest signal to center ([fce426a](https://github.com/cheminfo/nmrium/commit/fce426a9cebc265c7b6cea470dba7bcc461bc818))
* update OpenChemLib to v9 ([#3471](https://github.com/cheminfo/nmrium/issues/3471)) ([1e7d403](https://github.com/cheminfo/nmrium/commit/1e7d4032bf3156f3f73317c2b784b84493c0ebc6))


### Bug Fixes

* correct search range ([fce426a](https://github.com/cheminfo/nmrium/commit/fce426a9cebc265c7b6cea470dba7bcc461bc818))
* ensure assignment labels are unique across Cosy F1 and F2 dimensions ([45f931a](https://github.com/cheminfo/nmrium/commit/45f931ab135a815dfa1e0df4d8db1d56ab9ce407))
* ensure data is not empty before looking for a spectrum ([0cff982](https://github.com/cheminfo/nmrium/commit/0cff9820a4bb519a95f792ccfa9e85afc5e93b51))
* find the signal closest to the center of the zone ([fce426a](https://github.com/cheminfo/nmrium/commit/fce426a9cebc265c7b6cea470dba7bcc461bc818))
* fix: ensure only the first signal has the assignment label ([fce426a](https://github.com/cheminfo/nmrium/commit/fce426a9cebc265c7b6cea470dba7bcc461bc818))
* **jcamp1Dexport:** add frequencyOffset and spectralWidth info  ([#3504](https://github.com/cheminfo/nmrium/issues/3504)) ([8fccd4e](https://github.com/cheminfo/nmrium/commit/8fccd4e57c087494a1f3e48827a40c2484ba8c8d))
* update OpenChemLib to v9.1.1 ([#3492](https://github.com/cheminfo/nmrium/issues/3492)) ([736babb](https://github.com/cheminfo/nmrium/commit/736babb34391dcdc68f23f7a27d700298193229a))
* useWatch hook to watch matrix generation changes ([aa97dda](https://github.com/cheminfo/nmrium/commit/aa97dda3051cdef0b772423acc378a64632e620b))
* useWatch hook to watch prediction form changes ([3549c9b](https://github.com/cheminfo/nmrium/commit/3549c9ba925950e706e4dee40e9bf89592b9fe85)), closes [#3485](https://github.com/cheminfo/nmrium/issues/3485)
* useWatch hook to watch range editing form change ([f62aa1c](https://github.com/cheminfo/nmrium/commit/f62aa1ca8dcf7982d7812c1598b7383f512878cd)), closes [#3486](https://github.com/cheminfo/nmrium/issues/3486)
* useWatch hook to watch simulation form changes ([2292592](https://github.com/cheminfo/nmrium/commit/229259218e7170c53e0eaa23737fc5e613286dd0))


### Code Refactoring

* replace `nmr-load-save` deps by `nmrium-core` and `nmrium-core-plugins` ([#3473](https://github.com/cheminfo/nmrium/issues/3473)) ([af1503d](https://github.com/cheminfo/nmrium/commit/af1503dca49a3b24123276069140019f77f85639))

## [0.62.1](https://github.com/cheminfo/nmrium/compare/v0.62.0...v0.62.1) (2025-04-02)


### Bug Fixes

* update react-science ([#3452](https://github.com/cheminfo/nmrium/issues/3452)) ([bcf2496](https://github.com/cheminfo/nmrium/commit/bcf24969e575bfeaf724f7fd3de8e1f40134bb66))
* validate simulation options ([1b7b04a](https://github.com/cheminfo/nmrium/commit/1b7b04a40d7d9deb7e95a60b007f9e9631f6a35f))

## [0.62.0](https://github.com/cheminfo/nmrium/compare/v0.61.0...v0.62.0) (2025-03-25)


### Features

* collapse molecule all hydrogens ([f825f1e](https://github.com/cheminfo/nmrium/commit/f825f1e00b387e90a6d689eecdccf5f858637f27))
* expand molecule all hydrogens ([8bbba04](https://github.com/cheminfo/nmrium/commit/8bbba04598919b706c454894307e9a1f4fe9cf6f))
* improve 2d zoom with horizontal, vertical, and bidirectional ([2734993](https://github.com/cheminfo/nmrium/commit/27349938e13e6fbdb535b67bc5b798077e11cd69))
* improve brushing ([5912783](https://github.com/cheminfo/nmrium/commit/59127834b4254c7e06d74dbfc88c5c742ccb8c51))


### Bug Fixes

* append couplings when edit range ([#3442](https://github.com/cheminfo/nmrium/issues/3442)) ([e7652ff](https://github.com/cheminfo/nmrium/commit/e7652ff93fecea8323fa97395f2b7f48bcd5fcf1))

## [0.61.0](https://github.com/cheminfo/nmrium/compare/v0.60.0...v0.61.0) (2025-03-24)


### Features

* 2d apodization ([450d0e6](https://github.com/cheminfo/nmrium/commit/450d0e6e531928b1f4a7fa904a00d514a1fe257a))
* 2d zero filling ([#3306](https://github.com/cheminfo/nmrium/issues/3306)) ([613eb18](https://github.com/cheminfo/nmrium/commit/613eb18ed7a2259616ac2456f154451e561b6ae2))
* add new Filter section in case the filter does not exists ([c0dfee0](https://github.com/cheminfo/nmrium/commit/c0dfee07c07bf1dd35902ec1ee8d0cb2ff12b57a))
* adjust inset position and size using percentages instead of pixels ([57b9bde](https://github.com/cheminfo/nmrium/commit/57b9bde4364ecff22efe33996ea0a15803d007f2))
* change floating molecule position from pixels to percentage ([a778abc](https://github.com/cheminfo/nmrium/commit/a778abcd596180f31cd8bcfda11143d4fe654aa1))
* clear all added spectra from the database ([#3240](https://github.com/cheminfo/nmrium/issues/3240)) ([1ae01cd](https://github.com/cheminfo/nmrium/commit/1ae01cd263864c4987572d94fac50c891acddd52)), closes [#3235](https://github.com/cheminfo/nmrium/issues/3235)
* control the margin top of the peaks label ([e177d56](https://github.com/cheminfo/nmrium/commit/e177d56bae9fa33d6f6d0b7a403ad6e793c540cf)), closes [#3112](https://github.com/cheminfo/nmrium/issues/3112)
* create resizable svg element ([#3333](https://github.com/cheminfo/nmrium/issues/3333)) ([7216b6f](https://github.com/cheminfo/nmrium/commit/7216b6ff76ba066716c1c78d25243db856ab1bf5))
* customize assignment highlight color ([#3230](https://github.com/cheminfo/nmrium/issues/3230)) ([b6ae57c](https://github.com/cheminfo/nmrium/commit/b6ae57c1f04435faf527cc8644ab8b8dfcbbc269))
* customize tools indicator line color ([#3411](https://github.com/cheminfo/nmrium/issues/3411)) ([fc98768](https://github.com/cheminfo/nmrium/commit/fc9876809a3084df631d143540e24f8b3335a848))
* display 'No filters' when no filters ([cd28f64](https://github.com/cheminfo/nmrium/commit/cd28f649f91a5f22791ff5286db3ec151b6f9c4c))
* display tracking for selected spectra ([d29fad9](https://github.com/cheminfo/nmrium/commit/d29fad9b156f32a6f03e9ac1de003c589831c790)), closes [#3231](https://github.com/cheminfo/nmrium/issues/3231)
* enhance svg table styling and auto row spanning ([c033501](https://github.com/cheminfo/nmrium/commit/c033501ff4e7dbdc4dc4edf9bba3feb41030b910))
* export spectra insets ([57b9bde](https://github.com/cheminfo/nmrium/commit/57b9bde4364ecff22efe33996ea0a15803d007f2))
* fill chemical shift input  by using the cursor on the spectrum ([#3334](https://github.com/cheminfo/nmrium/issues/3334)) ([02ee2f8](https://github.com/cheminfo/nmrium/commit/02ee2f8107f4af15dbd186c12ab7b2518c825089))
* floating publication string over spectrum ([a22a55a](https://github.com/cheminfo/nmrium/commit/a22a55af0e3d958aaa350799f8c7ce6611999d0d))
* floating ranges over the spectrum ([69decfb](https://github.com/cheminfo/nmrium/commit/69decfb8ff82c926fde94d2d2729945c5c52be04))
* hiding integration value should lower the spectrum ([2ce8ef9](https://github.com/cheminfo/nmrium/commit/2ce8ef9d0f16c7a466feb7d72c1c70e51bcd16cd))
* hook to manager syn filter options ([84e9dc7](https://github.com/cheminfo/nmrium/commit/84e9dc708d87c396e509a2019aee2aed56b8aebe))
* implement right-side panels bar ([#3318](https://github.com/cheminfo/nmrium/issues/3318)) ([a4be76f](https://github.com/cheminfo/nmrium/commit/a4be76fa096644cd2b65095cbeae5bbcd9006f30))
* improve 1D apodization ([#3260](https://github.com/cheminfo/nmrium/issues/3260)) ([797fea4](https://github.com/cheminfo/nmrium/commit/797fea40e91caee106e3c1b5a815b684c2a6df9f))
* improve 1D phase correction options panel ([18f5574](https://github.com/cheminfo/nmrium/commit/18f55744a751ecf05018d4c8e3fa383d07eaf4cb))
* improve 2D phase correction filter options panel ([bcf945e](https://github.com/cheminfo/nmrium/commit/bcf945e5235331f74805ee36207da17fc4a3ffa3))
* improve apodization filter options ([860473c](https://github.com/cheminfo/nmrium/commit/860473ca6c1100f1ba510d1c917b266605b5463f))
* improve baseline correction filter options panel ([7db0a08](https://github.com/cheminfo/nmrium/commit/7db0a0814aad7928dc19318cc72cc13cf6aee9e2))
* improve editing of exclusion zones filter options ([fc2bc59](https://github.com/cheminfo/nmrium/commit/fc2bc5985fa93428f866c841dc18298f2b94a4c2))
* improve editing of Shift filter options ([c850388](https://github.com/cheminfo/nmrium/commit/c850388e753892f69e70157dfe9d0fd3671a0438))
* improve export publication string options ([9f2e971](https://github.com/cheminfo/nmrium/commit/9f2e9711f279ae9b85e6a3c83455ce0e5392d7a5))
* improve filter selection and editing behavior ([#3265](https://github.com/cheminfo/nmrium/issues/3265)) ([5fa9fd1](https://github.com/cheminfo/nmrium/commit/5fa9fd17918398c3681ce2b22e2add0ffc5328ac))
* improve image export scaling for PNG and SVG ([967e289](https://github.com/cheminfo/nmrium/commit/967e289e645e20f3323443fdaf7b5ceca3a22119))
* improve inset ([57b9bde](https://github.com/cheminfo/nmrium/commit/57b9bde4364ecff22efe33996ea0a15803d007f2))
* improve manual range picking and fix simulation of diagonal peaks in COSY prediction ([#3308](https://github.com/cheminfo/nmrium/issues/3308)) ([24dbc50](https://github.com/cheminfo/nmrium/commit/24dbc502cb51b6f61160c4a3a29333acc4964781))
* improve multiple spectra analysis data export ([9bcf680](https://github.com/cheminfo/nmrium/commit/9bcf680d781e796ec6b2d6c3388b9cca126c4c16)), closes [#3233](https://github.com/cheminfo/nmrium/issues/3233)
* improve path builder ([d0ca68d](https://github.com/cheminfo/nmrium/commit/d0ca68d014206a7e72299668fca597a8a140b984))
* improve processing user interaction ([#3327](https://github.com/cheminfo/nmrium/issues/3327)) ([513280f](https://github.com/cheminfo/nmrium/commit/513280f681d1a00e1abc58f657127da5825a032e))
* improve save as PNG, SVG and copy to clipboard ([#3252](https://github.com/cheminfo/nmrium/issues/3252)) ([683eb63](https://github.com/cheminfo/nmrium/commit/683eb63d2ca33cf2b5886eb5793f1f2ac8d5af38))
* inset ([57b9bde](https://github.com/cheminfo/nmrium/commit/57b9bde4364ecff22efe33996ea0a15803d007f2))
* inset actions ([57b9bde](https://github.com/cheminfo/nmrium/commit/57b9bde4364ecff22efe33996ea0a15803d007f2))
* inset brush end ([57b9bde](https://github.com/cheminfo/nmrium/commit/57b9bde4364ecff22efe33996ea0a15803d007f2))
* inset pain ([57b9bde](https://github.com/cheminfo/nmrium/commit/57b9bde4364ecff22efe33996ea0a15803d007f2))
* inset zoom out and zoom history ([57b9bde](https://github.com/cheminfo/nmrium/commit/57b9bde4364ecff22efe33996ea0a15803d007f2))
* interactive positioning of peak labels ([e177d56](https://github.com/cheminfo/nmrium/commit/e177d56bae9fa33d6f6d0b7a403ad6e793c540cf))
* make module compatible with native ESM ([#3271](https://github.com/cheminfo/nmrium/issues/3271)) ([a3db8cf](https://github.com/cheminfo/nmrium/commit/a3db8cf0001a3f3e77b05b4961268f86b9274df0))
* PNG export resolution ([#3237](https://github.com/cheminfo/nmrium/issues/3237)) ([4cbf6c4](https://github.com/cheminfo/nmrium/commit/4cbf6c40aa1043d91f214908ab6d83cc475a7efd))
* scale integrals in inset ([57b9bde](https://github.com/cheminfo/nmrium/commit/57b9bde4364ecff22efe33996ea0a15803d007f2))
* section component ([3f23dcd](https://github.com/cheminfo/nmrium/commit/3f23dcd031f3cc54574c9dff52a4162b5e016c8e))
* sort spectra by specific parameter ([1ccb784](https://github.com/cheminfo/nmrium/commit/1ccb784fff13432b99d6f8e275a50967b3ff35c6)), closes [#3232](https://github.com/cheminfo/nmrium/issues/3232)
* sort spectra without mutating the original state ([47fca1e](https://github.com/cheminfo/nmrium/commit/47fca1e201b59495f379caad89dd858c8556c7af))
* svg table component ([c033501](https://github.com/cheminfo/nmrium/commit/c033501ff4e7dbdc4dc4edf9bba3feb41030b910))
* toggle ranges, peaks, and integrals view properties inside insets ([57b9bde](https://github.com/cheminfo/nmrium/commit/57b9bde4364ecff22efe33996ea0a15803d007f2))
* **UI:** improve Sections component ([6302db2](https://github.com/cheminfo/nmrium/commit/6302db2a8a49fc3f5301b16ff853b586dbdc5c9e))
* update dependencies ([#3359](https://github.com/cheminfo/nmrium/issues/3359)) ([64b58b6](https://github.com/cheminfo/nmrium/commit/64b58b631dc326f88e12b78cc2a18705074835d7))
* vertical and horizontal zoom ([57b9bde](https://github.com/cheminfo/nmrium/commit/57b9bde4364ecff22efe33996ea0a15803d007f2))


### Bug Fixes

* assign indicator margin ([fc98768](https://github.com/cheminfo/nmrium/commit/fc9876809a3084df631d143540e24f8b3335a848))
* avoid React duplicated key ([19e663d](https://github.com/cheminfo/nmrium/commit/19e663d85a8f944a91340bf058a126ac410745c6))
* be more resilient with invalid types ([25aad7f](https://github.com/cheminfo/nmrium/commit/25aad7f194b6686f6047b45a7ae7cb0460caed65))
* convert range analysis from Pixel to PPM ([de4109b](https://github.com/cheminfo/nmrium/commit/de4109b8ffc4244a8172d44655e10a692dd64513)), closes [#3378](https://github.com/cheminfo/nmrium/issues/3378)
* delete filter ([7f6b32d](https://github.com/cheminfo/nmrium/commit/7f6b32dc207f5890de6d646567e6ce973a0bf07a))
* delete ranges,peaks, and integrals in insets ([57b9bde](https://github.com/cheminfo/nmrium/commit/57b9bde4364ecff22efe33996ea0a15803d007f2))
* disabled range pop actions menu if it is inset ([57b9bde](https://github.com/cheminfo/nmrium/commit/57b9bde4364ecff22efe33996ea0a15803d007f2))
* ensure apodization panel inputs fields shrink properly ([c976d34](https://github.com/cheminfo/nmrium/commit/c976d340fa791ec41b1c611b06b2ebb73c0e9652))
* ensure shortcuts are not ignored when the focused element is a radio or checkbox ([e8f3667](https://github.com/cheminfo/nmrium/commit/e8f3667f1dff1d77107110ec3853e69a9e9ff362))
* floating molecule position ([162946d](https://github.com/cheminfo/nmrium/commit/162946d2cafd8f7db70bc9dfb50b90184a5121f5))
* hide/show zone assignment label button ([a8f9092](https://github.com/cheminfo/nmrium/commit/a8f9092826d40cd3a5fad15879eaddfa444d34c5))
* highlight when toggling hydrogens in molecule could fail ([#3245](https://github.com/cheminfo/nmrium/issues/3245)) ([2276fe0](https://github.com/cheminfo/nmrium/commit/2276fe03cfead4fbd9e85b1f293c96a083327b60))
* import BoundingBox from nmr-load-save ([2837a0b](https://github.com/cheminfo/nmrium/commit/2837a0b0163652155762c763741db2330cc53ba5))
* import couplings from JCAMP-DX assignment ([#3398](https://github.com/cheminfo/nmrium/issues/3398)) ([6666a33](https://github.com/cheminfo/nmrium/commit/6666a33512d5e4776fdd0e9770b0a32ab0b5f2b7))
* inset viewer root ([57b9bde](https://github.com/cheminfo/nmrium/commit/57b9bde4364ecff22efe33996ea0a15803d007f2))
* inset zoom ([57b9bde](https://github.com/cheminfo/nmrium/commit/57b9bde4364ecff22efe33996ea0a15803d007f2))
* mark form as dirty when toggle apodization algorithms ([1b41b02](https://github.com/cheminfo/nmrium/commit/1b41b02aa8949eeef721d139470171ffbca4f67f))
* migration to version 8 ([0b964fd](https://github.com/cheminfo/nmrium/commit/0b964fd040f6fecc23e08aa9d5589ce8ca8a9461))
* molecule export as SVG ([#3371](https://github.com/cheminfo/nmrium/issues/3371)) ([c0d8191](https://github.com/cheminfo/nmrium/commit/c0d81916b673887951695aafbfc255d24c3086b0))
* multiplicity parsing of JCAMP-DX ([#3390](https://github.com/cheminfo/nmrium/issues/3390)) ([ebe92be](https://github.com/cheminfo/nmrium/commit/ebe92bebbb7112762acf6fa9edf5d227b5790e6f))
* pass start and end in PPM for 'ANALYZE_SPECTRA' action ([#3412](https://github.com/cheminfo/nmrium/issues/3412)) ([207bd1d](https://github.com/cheminfo/nmrium/commit/207bd1df7d3d1cf9b671ff71c3da9095c97f873d))
* prevent 'isOpen' and 'overflow' from being passed to the DOM ([75c9bd8](https://github.com/cheminfo/nmrium/commit/75c9bd8a82bf5e84c09ecbce9745e6d47202c9f3)), closes [#3399](https://github.com/cheminfo/nmrium/issues/3399)
* prevent click event if the user dragged the mouse ([#3388](https://github.com/cheminfo/nmrium/issues/3388)) ([0562360](https://github.com/cheminfo/nmrium/commit/0562360598b2b4ae54bd994fbd9761dbad1142bc))
* remove group delay points ([#3246](https://github.com/cheminfo/nmrium/issues/3246)) ([960ac94](https://github.com/cheminfo/nmrium/commit/960ac947fce7c665de1ff0cba110391e0d869fa9))
* rescale the canvas based on the DPI ([4cbf6c4](https://github.com/cheminfo/nmrium/commit/4cbf6c40aa1043d91f214908ab6d83cc475a7efd))
* reset domain when cancel filter in live preview ([32a0e23](https://github.com/cheminfo/nmrium/commit/32a0e2346311b7adcf9766dd4818ce4d479d7bfa))
* rollback spectrum to the point right before the shift ([#3435](https://github.com/cheminfo/nmrium/issues/3435)) ([48c6576](https://github.com/cheminfo/nmrium/commit/48c6576a40f1a4f86e3d44f6f18bbf2898e58988))
* select component style ([f1a24e5](https://github.com/cheminfo/nmrium/commit/f1a24e5a1289ed4bde2d42a2610b9fa41ff11f66))
* show/hide the spectra legend fields ([20126dd](https://github.com/cheminfo/nmrium/commit/20126dd157b07e04041306407d8f2bf6554050db))
* sort the selected the range ([b164290](https://github.com/cheminfo/nmrium/commit/b164290c0324b9b4b9dfd2a239e9394b7c21963f))
* spectrum opacity inside inset ([57b9bde](https://github.com/cheminfo/nmrium/commit/57b9bde4364ecff22efe33996ea0a15803d007f2))
* take into account the line width in 1D prediction ([ea224b8](https://github.com/cheminfo/nmrium/commit/ea224b8c429f08507e402c788021230a54277bb1))
* update dependencies ([#3431](https://github.com/cheminfo/nmrium/issues/3431)) ([991bab4](https://github.com/cheminfo/nmrium/commit/991bab41e26294c8cad6563cf6df4fd87aa1fe36))
* update domain in 2D ([b860f84](https://github.com/cheminfo/nmrium/commit/b860f84bb1409bd7bc284d02c6aba4184fe61efd))
* update react-dropzone ([de05c71](https://github.com/cheminfo/nmrium/commit/de05c71fdae44558e1a2dd8c353525df190b2d07))
* update react-science and resolve React warnings ([#3369](https://github.com/cheminfo/nmrium/issues/3369)) ([3ba4ad5](https://github.com/cheminfo/nmrium/commit/3ba4ad53a90ec053117151fc010fc49ef817bad0))
* **varian:** include procPar into metadata ([#3241](https://github.com/cheminfo/nmrium/issues/3241)) ([39ee706](https://github.com/cheminfo/nmrium/commit/39ee706f07a0fa9b1be1d37e27ab41c1f35d30dd))
* zones preferences ([e9a2b0c](https://github.com/cheminfo/nmrium/commit/e9a2b0cd41c5d1e589b065ac42d45a6b9f1250de))

## [0.60.0](https://github.com/cheminfo/nmrium/compare/v0.59.0...v0.60.0) (2024-08-24)


### Features

* add draggable functionality for BlueprintJS dialog ([960e844](https://github.com/cheminfo/nmrium/commit/960e84416edab1e8f036fe33ce2618d43eaed35b))
* implement dialog manager ([61a7192](https://github.com/cheminfo/nmrium/commit/61a719269706a79a5155a6707cb8a915c6cd28a6))
* improve draggable dialog ([0af665b](https://github.com/cheminfo/nmrium/commit/0af665b2d79828782abdc3a5ac9f0ce06907af4e))


### Bug Fixes

* automatic phase correction if phase correction values is undefined ([#3204](https://github.com/cheminfo/nmrium/issues/3204)) ([3ce2b4f](https://github.com/cheminfo/nmrium/commit/3ce2b4f0fc4a5c190c6323f356099de6cb4c459a))
* display error message when pasting MOL or SMILES fails ([0ada098](https://github.com/cheminfo/nmrium/commit/0ada098b88ec04020832c8884a2cbe2b0d554789))
* keep matrix range unchanged when adding exclusion zones ([dbf70c7](https://github.com/cheminfo/nmrium/commit/dbf70c7660aafd60a22b46ec7162b7beb60797cd)), closes [#3198](https://github.com/cheminfo/nmrium/issues/3198)
* prevent spectrum selection during zoom in stack mode ([4f4cd45](https://github.com/cheminfo/nmrium/commit/4f4cd45664adca979913aa9ef647f20799ab141b)), closes [#3190](https://github.com/cheminfo/nmrium/issues/3190)
* restore pivot functionality and add test case ([571fc64](https://github.com/cheminfo/nmrium/commit/571fc64bff52711c3f3473f924897c067b370e2e))

## [0.59.0](https://github.com/cheminfo/nmrium/compare/v0.58.0...v0.59.0) (2024-08-08)


### ⚠ BREAKING CHANGES

* rename `NMRiumRef` type to `NMRiumRefAPI`

### release-as

* v0.59.0 ([#3187](https://github.com/cheminfo/nmrium/issues/3187)) ([0bed397](https://github.com/cheminfo/nmrium/commit/0bed3979cb998524380364c099aeb730c19832b9))


### Features

* add external ref API to load files ([#3147](https://github.com/cheminfo/nmrium/issues/3147)) ([3620af4](https://github.com/cheminfo/nmrium/commit/3620af47e72127426f89c00b6571a6fac06f9ef2))
* avoid splitting molecule fragments into separate molecules ([#3174](https://github.com/cheminfo/nmrium/issues/3174)) ([c05db64](https://github.com/cheminfo/nmrium/commit/c05db642f1a4f4351bfcaa1d3f7c96faa518a872))
* create alert component ([6de9be1](https://github.com/cheminfo/nmrium/commit/6de9be125355ab361f16c1c05681602b1c2572fe))
* export as JCAMP-DX includes all metadata ([#3162](https://github.com/cheminfo/nmrium/issues/3162)) ([6caf0a7](https://github.com/cheminfo/nmrium/commit/6caf0a71f0d3ed5ea12e415b39636a94ab1fbc22))
* export for CT ([23b2f1d](https://github.com/cheminfo/nmrium/commit/23b2f1df55037a8d76f997021f3b6913022cf92b))
* export JCAMP-DX from the main export menu ([cbc5a4c](https://github.com/cheminfo/nmrium/commit/cbc5a4c6f85cc8712a3006270917bea717b1bd81))
* export ranges as TSV file ([cea8135](https://github.com/cheminfo/nmrium/commit/cea81353adb1d72a24206c7cff99bd8c668f61d6))
* hide External APIs tab behind experimental feature flag ([7dae46b](https://github.com/cheminfo/nmrium/commit/7dae46bceb52ca84580ec91fb266b0e303ed67d3))
* implement external APIs management in general settings ([7dae46b](https://github.com/cheminfo/nmrium/commit/7dae46bceb52ca84580ec91fb266b0e303ed67d3))
* improve selection of spectra ([#3159](https://github.com/cheminfo/nmrium/issues/3159)) ([2df4b33](https://github.com/cheminfo/nmrium/commit/2df4b3345c44b0758ce9ae7145157183e6f0f2c2))
* print spectra ([#2786](https://github.com/cheminfo/nmrium/issues/2786)) ([1287bc1](https://github.com/cheminfo/nmrium/commit/1287bc18e8f7d6073c1f905cd3564f257508b563)), closes [#3139](https://github.com/cheminfo/nmrium/issues/3139)
* resurrect spectrum from signals ([c32b594](https://github.com/cheminfo/nmrium/commit/c32b594dfbad2394ee5fdd81c153fdb0cb38e0c9))


### Bug Fixes

* allow big couplings when a range is added manually ([#3157](https://github.com/cheminfo/nmrium/issues/3157)) ([e6fb70a](https://github.com/cheminfo/nmrium/commit/e6fb70ac17341c21624edb1b79cc197a70896e2c))
* avoid nesting a button within another button inside accordion item ([#3167](https://github.com/cheminfo/nmrium/issues/3167)) ([903ca53](https://github.com/cheminfo/nmrium/commit/903ca530b66725e1c7a524624cd433b63eafa520))
* delete all filters should be enabled ([6a12a9d](https://github.com/cheminfo/nmrium/commit/6a12a9d635afc71a26e02430ca7d365bc9e3966b))
* disabled toolbar popover item ([9c59558](https://github.com/cheminfo/nmrium/commit/9c59558ad1662520d14205da01a1bc1179c6b45c))
* do not allow deletion of digital filter ([e41fa05](https://github.com/cheminfo/nmrium/commit/e41fa05e95b37afc4c7d4e34047fbbd4df644b2b)), closes [#3136](https://github.com/cheminfo/nmrium/issues/3136)
* extract atoms correctly using mf-parser ([2b5b905](https://github.com/cheminfo/nmrium/commit/2b5b905507ed2c9af30d3bc001308025c4c8d98f))
* import from publication string with common names of multiplicities ([#3154](https://github.com/cheminfo/nmrium/issues/3154)) ([9ff4ee0](https://github.com/cheminfo/nmrium/commit/9ff4ee02634dec0459d58f93930060e3a07d325c))
* pre-calculated baseline zones using Dietrich algor ([#3153](https://github.com/cheminfo/nmrium/issues/3153)) ([90a3f97](https://github.com/cheminfo/nmrium/commit/90a3f9749d1340fe362ab0b925cf9b04435bb566))
* prevent deletion in case no correlations links in summary panel ([5f2b614](https://github.com/cheminfo/nmrium/commit/5f2b6143c948c80629afe1321315babbdf78c1a9))
* prevent vertical 2D scale from triggering data change callback ([d1a48f1](https://github.com/cheminfo/nmrium/commit/d1a48f10061ecf5a80c97f7408de905b7ef40f60))
* remove associated objects from the view and keyPreferences upon spectrum deletion ([b0d41e9](https://github.com/cheminfo/nmrium/commit/b0d41e9dc3250d99714174a0ea220c691837eaae)), closes [#3125](https://github.com/cheminfo/nmrium/issues/3125)
* reprocess spectra when all filters are deleted ([af618ec](https://github.com/cheminfo/nmrium/commit/af618ecafc7fe51bb96e7e477f51e75b39873a0c))
* rollback to digital filter ([218891b](https://github.com/cheminfo/nmrium/commit/218891b5f392fd49e90c98321b4c477c334f7050)), closes [#3163](https://github.com/cheminfo/nmrium/issues/3163)
* switch between baseline algorithms should affect the spectrum ([1549ce0](https://github.com/cheminfo/nmrium/commit/1549ce0b5afbc860b52e6d2c1d1e2921c80d4e4f))

## [0.58.0](https://github.com/cheminfo/nmrium/compare/v0.57.1...v0.58.0) (2024-07-10)


### Features

* improve info block ([b838b34](https://github.com/cheminfo/nmrium/commit/b838b3432c4af5a1396397b1dde986388cba06a0))
* move the title block ([b838b34](https://github.com/cheminfo/nmrium/commit/b838b3432c4af5a1396397b1dde986388cba06a0))


### Bug Fixes

* apply apodization on the fly when opening its options panel ([506bc4b](https://github.com/cheminfo/nmrium/commit/506bc4bc6c6743a72a325f30c4bfe801bedf6c09))
* apply baseline correction on the fly when opening its options panel ([1b8ebdc](https://github.com/cheminfo/nmrium/commit/1b8ebdc32b80d9935724a0f49f202dd0fe68ca5b))
* apply zero filling on the fly when opening its options panel ([d43911d](https://github.com/cheminfo/nmrium/commit/d43911d786b46eab03a1347f3c4c3ace79d24903))
* correctly handle optional mapValue function ([106f2c9](https://github.com/cheminfo/nmrium/commit/106f2c94c948ce5199eec8adbd09dff1856606a2))
* read title file in bruker pdata ([#3114](https://github.com/cheminfo/nmrium/issues/3114)) ([f4a18b5](https://github.com/cheminfo/nmrium/commit/f4a18b5ad3a7ce2bfb03d2e6b8ecb2a12dc35e17))
* save preferences in the local storage ([6f0ac78](https://github.com/cheminfo/nmrium/commit/6f0ac783c4835b6eff71139dd0ee9d686bc3e15b))

## [0.57.1](https://github.com/cheminfo/nmrium/compare/v0.57.0...v0.57.1) (2024-07-04)


### Bug Fixes

* set query value to an empty string when it is null in the suggest input ([75108c6](https://github.com/cheminfo/nmrium/commit/75108c68b73f69be456afe72869976a9714bc1ea))

## [0.57.0](https://github.com/cheminfo/nmrium/compare/v0.56.0...v0.57.0) (2024-07-03)


### Features

* edit meta info ([965f316](https://github.com/cheminfo/nmrium/commit/965f316a875ba9307f46398162adaf636cb430dc))
* improve database ([#3102](https://github.com/cheminfo/nmrium/issues/3102)) ([d33a9f0](https://github.com/cheminfo/nmrium/commit/d33a9f0f75c3cd92b02da16e1f9a73385c9e057d))
* improve recolor by distinct value ([#3082](https://github.com/cheminfo/nmrium/issues/3082)) ([5c52a37](https://github.com/cheminfo/nmrium/commit/5c52a370e2bfa88f0dac3b93a099fcbd2310d723))


### Bug Fixes

* calculate of decimal digits in getDecimalsCount function ([53568de](https://github.com/cheminfo/nmrium/commit/53568dec78b8c06347902313927de6475e8f19fd))
* improve speed of contour plot ([#3050](https://github.com/cheminfo/nmrium/issues/3050)) ([1b62142](https://github.com/cheminfo/nmrium/commit/1b62142ff692e6d2019319128e211fcbcfea72a4))
* load raw bruker data from nmredata ([#3098](https://github.com/cheminfo/nmrium/issues/3098)) ([addb7bc](https://github.com/cheminfo/nmrium/commit/addb7bc6eef2d279936749e8539317c9d22cd56c))
* predicted spectrum name and frequency ([#3081](https://github.com/cheminfo/nmrium/issues/3081)) ([67ad22c](https://github.com/cheminfo/nmrium/commit/67ad22c68af4375b24332b48b6f887c5a3552ed1))
* radio button ([258efc7](https://github.com/cheminfo/nmrium/commit/258efc7779cb625f35309d6de847c6a7c8dd84bb))
* update dependencies ([#3099](https://github.com/cheminfo/nmrium/issues/3099)) ([a6319a2](https://github.com/cheminfo/nmrium/commit/a6319a2d8e02c46473807a7b4069a3e0de1af589))
* useForm types ([258efc7](https://github.com/cheminfo/nmrium/commit/258efc7779cb625f35309d6de847c6a7c8dd84bb))

## [0.56.0](https://github.com/cheminfo/nmrium/compare/v0.55.0...v0.56.0) (2024-06-01)


### Features

* generate and display  stocsy and boxplot ([#3055](https://github.com/cheminfo/nmrium/issues/3055)) ([83ff531](https://github.com/cheminfo/nmrium/commit/83ff53108a2c2555fafaf227fb632a8e8270adae))


### Bug Fixes

* select stocsy pivot point when the  exclusion zones tool selected ([c527775](https://github.com/cheminfo/nmrium/commit/c527775296149c1f5e38e12cda8a57bc0a99062c))
* set minimum width and height for the database molecule structure ([#3069](https://github.com/cheminfo/nmrium/issues/3069)) ([4ce0d2b](https://github.com/cheminfo/nmrium/commit/4ce0d2b363b73d561a0ba2e5810c84d28bedf341))
* toggle the matrix generation exclusion zones tool ([c527775](https://github.com/cheminfo/nmrium/commit/c527775296149c1f5e38e12cda8a57bc0a99062c))

## [0.55.0](https://github.com/cheminfo/nmrium/compare/v0.54.0...v0.55.0) (2024-05-18)


### Features

* exercise workspace has invert by default ([#3047](https://github.com/cheminfo/nmrium/issues/3047)) ([ab72c58](https://github.com/cheminfo/nmrium/commit/ab72c582d369e4b13462aa5fc52c62293615ce9a))
* implement settings migration ([cabfa87](https://github.com/cheminfo/nmrium/commit/cabfa876f1d7b53b857e1cb66f20ab46a1e006e9))
* improve range assignment label addition and editing functionality ([021656c](https://github.com/cheminfo/nmrium/commit/021656cc6b2fa82e3474b353fb3c9277de6ee1a3))
* improve zone assignment label addition and editing functionality ([#3034](https://github.com/cheminfo/nmrium/issues/3034)) ([d626f5e](https://github.com/cheminfo/nmrium/commit/d626f5e8c0f7e0c31732bfa1339616346c7bce1d))
* map shortcut with Shift key based on invert flag ([#3049](https://github.com/cheminfo/nmrium/issues/3049)) ([65e7cb1](https://github.com/cheminfo/nmrium/commit/65e7cb15c78fc89674c51324b4d9597988c71f9b))
* update nmr-load-save to version 0.32.0 ([cabfa87](https://github.com/cheminfo/nmrium/commit/cabfa876f1d7b53b857e1cb66f20ab46a1e006e9))
* zone assignment label ([#3018](https://github.com/cheminfo/nmrium/issues/3018)) ([5c3c2a5](https://github.com/cheminfo/nmrium/commit/5c3c2a5ce34e73e7532fc109d7455b83a45eede1))
* zoom out based on defined axis domain preferences ([d0bab9b](https://github.com/cheminfo/nmrium/commit/d0bab9b524bcb30cdd671b638b7ba7cb1025ec65)), closes [#3024](https://github.com/cheminfo/nmrium/issues/3024)


### Bug Fixes

* 0 value should be taken in account in the axis domain ([d0bab9b](https://github.com/cheminfo/nmrium/commit/d0bab9b524bcb30cdd671b638b7ba7cb1025ec65))
* multiple spectra analysis sorting option ([bde952b](https://github.com/cheminfo/nmrium/commit/bde952bb813d0d344f45646f25ab0735a736f5e9))
* react table warnings ([8dedfe5](https://github.com/cheminfo/nmrium/commit/8dedfe58bedb826e1ac67f790e14c7ac449c1253))
* recalculate integral reducer points based on the zoom range ([95cd297](https://github.com/cheminfo/nmrium/commit/95cd29730eb6805c0abb335a960a25dffcd788a0)), closes [#3027](https://github.com/cheminfo/nmrium/issues/3027)
* remove useless border and invalid flex config from DropZone wrapper ([#3053](https://github.com/cheminfo/nmrium/issues/3053)) ([a8a5697](https://github.com/cheminfo/nmrium/commit/a8a56978473bada380fc684f0716545e559c6984))

## [0.54.0](https://github.com/cheminfo/nmrium/compare/v0.53.0...v0.54.0) (2024-04-18)


### Features

* automatic two dimensions phase correction ([#3022](https://github.com/cheminfo/nmrium/issues/3022)) ([690971f](https://github.com/cheminfo/nmrium/commit/690971f9dc0774379d97a655e20285bf3c20d297))
* improve main toolbar tooltip ([#3008](https://github.com/cheminfo/nmrium/issues/3008)) ([dc5703c](https://github.com/cheminfo/nmrium/commit/dc5703c9a3bd93bcf619637bd9f85a21d08d127d))
* improve spectra recoloring ([#2997](https://github.com/cheminfo/nmrium/issues/2997)) ([c446198](https://github.com/cheminfo/nmrium/commit/c446198ce3231c7d4ec47edc0fab4406e4e2a5c9))


### Bug Fixes

* add more gyromagnetic ratio constants ([#3006](https://github.com/cheminfo/nmrium/issues/3006)) ([cf9cb10](https://github.com/cheminfo/nmrium/commit/cf9cb10f274de3bfe8ce4c4cd1e227f996bf3d9f))
* create a simple signal if data length is smaller than 7 points ([#3020](https://github.com/cheminfo/nmrium/issues/3020)) ([c0b406d](https://github.com/cheminfo/nmrium/commit/c0b406d0e43617e4de8e2a8a567a623c2aa7f726))
* crosshair label position ([#3001](https://github.com/cheminfo/nmrium/issues/3001)) ([9381c21](https://github.com/cheminfo/nmrium/commit/9381c2183d98befa81ee5187800909c1377ebcff))
* info pane appearance ([#3005](https://github.com/cheminfo/nmrium/issues/3005)) ([4fca536](https://github.com/cheminfo/nmrium/commit/4fca536605a16355545e7f8533ddf5a0fb05e8fc))
* set the same workspace for the  base and current object, in case, the source is a nmriumFile ([cafc51a](https://github.com/cheminfo/nmrium/commit/cafc51a7af4ed5a7aba8eba1cf0836ed80ce7f81))
* set the workspace settings from the nmrium object ([acb20a6](https://github.com/cheminfo/nmrium/commit/acb20a60618d06e4c8f1523c574ab874daf3eb02))
* vertical slicing on phase correction ([#3015](https://github.com/cheminfo/nmrium/issues/3015)) ([e1c7b7c](https://github.com/cheminfo/nmrium/commit/e1c7b7c7e3be8aad1282d1bdd6194a9f5108b94e))

## [0.53.0](https://github.com/cheminfo/nmrium/compare/v0.52.0...v0.53.0) (2024-03-22)


### Features

* create and edit assignment labels for ranges ([#2971](https://github.com/cheminfo/nmrium/issues/2971)) ([31297a2](https://github.com/cheminfo/nmrium/commit/31297a2521d9b543b958894ad5402d7d42ee5f24))
* set zoom in/out as the default behavior with Shift + scroll ([#2975](https://github.com/cheminfo/nmrium/issues/2975)) ([b5d28f6](https://github.com/cheminfo/nmrium/commit/b5d28f61f4e89648fa776f24d9114b8e7416c19f))


### Bug Fixes

* avoid reselecting the tool if it's already selected ([19f5857](https://github.com/cheminfo/nmrium/commit/19f585711b4145e5f2606801760cdc617c2a2809))
* **Bruker 2D SER:** fix imaginary data ([#2977](https://github.com/cheminfo/nmrium/issues/2977)) ([0a6c21d](https://github.com/cheminfo/nmrium/commit/0a6c21de1972470763dc19c7cfa9b548e194dcd8))
* ensure activeSpectrum and tempData are not null ([9e50f1c](https://github.com/cheminfo/nmrium/commit/9e50f1c22cbe1a1c7ba0f529c04f24fabb618256))
* re-initialize FifoLogger instance when opening the modal ([73f2750](https://github.com/cheminfo/nmrium/commit/73f275063a7b13605753ac62fcff0bf6625e5223)), closes [#2981](https://github.com/cheminfo/nmrium/issues/2981)
* spectra simulation options validation ([988dfec](https://github.com/cheminfo/nmrium/commit/988dfec1c29fcba5f0004de621fd087cd2e5c0be))
* Y axis in 2D jcamp from jeol delta ([#2992](https://github.com/cheminfo/nmrium/issues/2992)) ([6f0f2c5](https://github.com/cheminfo/nmrium/commit/6f0f2c51d4bde54cfba5426c24d66071bd9ff2ef))

## [0.52.0](https://github.com/cheminfo/nmrium/compare/v0.51.0...v0.52.0) (2024-03-19)


### Features

* **zones:** add access to maxPercentCutOff option ([#2963](https://github.com/cheminfo/nmrium/issues/2963)) ([544c2cc](https://github.com/cheminfo/nmrium/commit/544c2ccbd44c63791838dbaf3853976b29d57567))


### Bug Fixes

* add missing dep ([#2972](https://github.com/cheminfo/nmrium/issues/2972)) ([72e969d](https://github.com/cheminfo/nmrium/commit/72e969d813557733c2cfce2d8b4a3905f5159c17))
* add missing dep ([#2972](https://github.com/cheminfo/nmrium/issues/2972)) ([72e969d](https://github.com/cheminfo/nmrium/commit/72e969d813557733c2cfce2d8b4a3905f5159c17))
* improve consistency of labels ([#2970](https://github.com/cheminfo/nmrium/issues/2970)) ([92fd75d](https://github.com/cheminfo/nmrium/commit/92fd75d14cc262bcfcf087e4f36ddee7f6becf8b))
* set the size correctly for real part in slicing function ([#2973](https://github.com/cheminfo/nmrium/issues/2973)) ([47233fc](https://github.com/cheminfo/nmrium/commit/47233fcb5e76dc582254c346f39ccdc11ba7c94b))

## [0.51.0](https://github.com/cheminfo/nmrium/compare/v0.50.1...v0.51.0) (2024-03-16)


### Features

* edit range peaks ([#2953](https://github.com/cheminfo/nmrium/issues/2953)) ([bcddb6e](https://github.com/cheminfo/nmrium/commit/bcddb6e742b4bbbee7809bf70d5a9b43ae76efd3))
* enable spectrum selection only when the zoom tool is activated ([#2957](https://github.com/cheminfo/nmrium/issues/2957)) ([a650eac](https://github.com/cheminfo/nmrium/commit/a650eac95897f03ad114eeb3d99c6abfeb233e96))
* improve multiple spectra analysis ([#2946](https://github.com/cheminfo/nmrium/issues/2946)) ([acce39e](https://github.com/cheminfo/nmrium/commit/acce39e33f45a96360f42b4170ae26e0abb46c1c))
* two dimensions phase correction filter ([#2930](https://github.com/cheminfo/nmrium/issues/2930)) ([adb8098](https://github.com/cheminfo/nmrium/commit/adb8098e2732ce925c6521945374afd66f10cce4))
* zoom in/out with the mouse wheel ([#2964](https://github.com/cheminfo/nmrium/issues/2964)) ([a54569f](https://github.com/cheminfo/nmrium/commit/a54569f4f201978017bac9e09d5897867c7fb559))


### Bug Fixes

* clear zoom history and hide filter options panel when apply FFT ([#2947](https://github.com/cheminfo/nmrium/issues/2947)) ([e7fb21f](https://github.com/cheminfo/nmrium/commit/e7fb21fb04ae9fcb335dba51ae802017173be58b)), closes [#2923](https://github.com/cheminfo/nmrium/issues/2923)
* do not raise an error if no 1D trace spectra are found ([#2944](https://github.com/cheminfo/nmrium/issues/2944)) ([c141116](https://github.com/cheminfo/nmrium/commit/c1411162d60146cc4da0217d3f4cc0769875c9c8))
* improve peak picking ([#2949](https://github.com/cheminfo/nmrium/issues/2949)) ([f169495](https://github.com/cheminfo/nmrium/commit/f16949563927c0af0b2274dce87266b060ce9d67))
* improve wrapping of small prediction panel toolbar ([#2954](https://github.com/cheminfo/nmrium/issues/2954)) ([31be6ba](https://github.com/cheminfo/nmrium/commit/31be6ba0cf16b5a217ea1088fe1224fa12088c13))
* pass the data to the filter before the filter affects it ([#2948](https://github.com/cheminfo/nmrium/issues/2948)) ([d8341e9](https://github.com/cheminfo/nmrium/commit/d8341e94e107f46038d8d770b7ad860ddac48e9a))

## [0.50.1](https://github.com/cheminfo/nmrium/compare/v0.50.0...v0.50.1) (2024-02-26)


### Documentation

* add BigMap in about NMRium ([#2925](https://github.com/cheminfo/nmrium/issues/2925)) ([5cb4fc4](https://github.com/cheminfo/nmrium/commit/5cb4fc4cde64221d01d13bff7c8cebb209ca14eb))
* fix bigmap funding ([#2924](https://github.com/cheminfo/nmrium/issues/2924)) ([52eeaf7](https://github.com/cheminfo/nmrium/commit/52eeaf7608ddd967513bba080e2f552be1c7a864))

## [0.50.0](https://github.com/cheminfo/nmrium/compare/v0.49.0...v0.50.0) (2024-02-21)


### Features

* display the tree for similarity ([2a21d17](https://github.com/cheminfo/nmrium/commit/2a21d1786e74b9fa8b646c07abdf7275a3cb7a51)), closes [#2905](https://github.com/cheminfo/nmrium/issues/2905)
* export spectrum as text file ([c5ad409](https://github.com/cheminfo/nmrium/commit/c5ad409c30f71bf1b6b1e99263f0ab55f11da16b))


### Bug Fixes

* confirmation box ([fe44670](https://github.com/cheminfo/nmrium/commit/fe44670a27ad4938efb5eb75556b8db67fcc8abe))
* exclude export the the rectangle over the spectrum in stack mode ([b6f9a99](https://github.com/cheminfo/nmrium/commit/b6f9a9910f758de07156833bc6fd366eaf3120d9))
* experiment type by pulse sequence ([#2920](https://github.com/cheminfo/nmrium/issues/2920)) ([7d51e12](https://github.com/cheminfo/nmrium/commit/7d51e12c09b98bd92801feda89400e0de302f7c5))
* improve info from Nanalysis n adapt bruker phase correction parameters ([#2914](https://github.com/cheminfo/nmrium/issues/2914)) ([348ed95](https://github.com/cheminfo/nmrium/commit/348ed95dc9d9fc43df6aaa6fa993661b37f101bd))
* range select for j coupling ([#2917](https://github.com/cheminfo/nmrium/issues/2917)) ([2d033e8](https://github.com/cheminfo/nmrium/commit/2d033e87461b57fa58fbe081281b37441925ed6a))

## [0.49.0](https://github.com/cheminfo/nmrium/compare/v0.48.0...v0.49.0) (2024-02-09)


### Features

* add a general preference for a popup logging level ([7b532c1](https://github.com/cheminfo/nmrium/commit/7b532c1a4db54a98dc76da0922d9729615c26365))
* add a link to NMRium videos channel ([4ddf7fe](https://github.com/cheminfo/nmrium/commit/4ddf7fe872fc080b53ac0e4ab56ef65edfbb568c)), closes [#2883](https://github.com/cheminfo/nmrium/issues/2883)
* detect baseline zones automatically ([6358e89](https://github.com/cheminfo/nmrium/commit/6358e89db0d33f509aa99334efbff5713657239b))
* display horizontal line at y = 0 for phase and baseline correction ([fda80c5](https://github.com/cheminfo/nmrium/commit/fda80c5f483a3d457312ed7af3506b5e8f4a449b)), closes [#2870](https://github.com/cheminfo/nmrium/issues/2870) [#2871](https://github.com/cheminfo/nmrium/issues/2871)
* improve resurrect spectrum from publication string and avoid crash ([#2879](https://github.com/cheminfo/nmrium/issues/2879)) ([004d983](https://github.com/cheminfo/nmrium/commit/004d98374acac909df2e2219772887e6c9c4beb2))
* improve SVG exportation ([#2882](https://github.com/cheminfo/nmrium/issues/2882)) ([a974c15](https://github.com/cheminfo/nmrium/commit/a974c1507e1a453bc52268090bbaa3ba56f9cf35))
* invert actions ([#2862](https://github.com/cheminfo/nmrium/issues/2862)) ([3b18b4e](https://github.com/cheminfo/nmrium/commit/3b18b4ebf3f0e31bdb0e6035d4f710dd2cfe5c56))
* resize baseline zones ([a3291b7](https://github.com/cheminfo/nmrium/commit/a3291b77599f268845c4955fba185e5841a6dd3a))
* show assignment atoms over ranges ([#2869](https://github.com/cheminfo/nmrium/issues/2869)) ([63e7785](https://github.com/cheminfo/nmrium/commit/63e77859f2d816d31af68d4ae8c8f979622ed192))
* sort ranges by chemical shifts ([d88c8c2](https://github.com/cheminfo/nmrium/commit/d88c8c216025f7d5dd1404f360efb07c055d8b7c)), closes [#2866](https://github.com/cheminfo/nmrium/issues/2866)
* split pseudo2D inversion recovery spectra ([#2846](https://github.com/cheminfo/nmrium/issues/2846)) ([ab43ee2](https://github.com/cheminfo/nmrium/commit/ab43ee2dbaef18073edb1194c78d33cf9d5e63ec))


### Bug Fixes

* baseline correction options ([44261ae](https://github.com/cheminfo/nmrium/commit/44261aea95738f856e15492273e8d0b95f0d1d04))
* correct rollback spectrum behaviour ([4f316a3](https://github.com/cheminfo/nmrium/commit/4f316a34284900f5a6b9a6f3030cc0851d360cf1)), closes [#2876](https://github.com/cheminfo/nmrium/issues/2876) [#2889](https://github.com/cheminfo/nmrium/issues/2889)
* prevent the refresh of the scale in baseline correction ([cdeb286](https://github.com/cheminfo/nmrium/commit/cdeb286d7373c3b1da9f0a6592037dcfbe2678bf)), closes [#2872](https://github.com/cheminfo/nmrium/issues/2872)
* reorder sub matrices from bruker data n fix varian loading ([#2847](https://github.com/cheminfo/nmrium/issues/2847)) ([ef7e1b3](https://github.com/cheminfo/nmrium/commit/ef7e1b33585340d5ec85fb0ce1c83f988805ef41))
* spectra preferences validation ([788cb45](https://github.com/cheminfo/nmrium/commit/788cb4537fc08b29c488ac609b568d3c31824800))

## [0.48.0](https://github.com/cheminfo/nmrium/compare/v0.47.0...v0.48.0) (2024-01-26)


### Features

* allow save range with no signals ([6f7bfad](https://github.com/cheminfo/nmrium/commit/6f7bfadae2610cd54c1fdec6f587a466c66f0b19))
* allow to delete info.name and info.solvent ([8fcfb77](https://github.com/cheminfo/nmrium/commit/8fcfb7719c7fd5fe0fb038c730486585b8d9b009)), closes [#2823](https://github.com/cheminfo/nmrium/issues/2823)
* improve matrix exportation ([8b57b9f](https://github.com/cheminfo/nmrium/commit/8b57b9f9c0c0f3db93dac0833a94ec394107d801)), closes [#2837](https://github.com/cheminfo/nmrium/issues/2837)
* select spectrum from the displayer ([313c3bd](https://github.com/cheminfo/nmrium/commit/313c3bde8fd08b841826a725e81ecc04d7e6612f)), closes [#2849](https://github.com/cheminfo/nmrium/issues/2849)


### Bug Fixes

* copy image to clipboard in Firefox ([21ce320](https://github.com/cheminfo/nmrium/commit/21ce3209fab4c7ec9c9ef4c64e748f02760f8392))
* create info1D for projections ([#2841](https://github.com/cheminfo/nmrium/issues/2841)) ([1571b50](https://github.com/cheminfo/nmrium/commit/1571b506abec003628a3566d73ca0b5c6c267f6b))
* disable auto-translate of the NMRium component ([#2859](https://github.com/cheminfo/nmrium/issues/2859)) ([d5e178e](https://github.com/cheminfo/nmrium/commit/d5e178e4df44f5c335c1ccd1377fba2adf37cfb2))
* plotting the derived value ([f176fc0](https://github.com/cheminfo/nmrium/commit/f176fc0cf50b001e8408fb719c4a7b27dbc9d166)), closes [#2834](https://github.com/cheminfo/nmrium/issues/2834)
* reapply filters when applying spectra processing filter ([14b344c](https://github.com/cheminfo/nmrium/commit/14b344c0bbfa819e3b0e7c69df14a4fae95aef94)), closes [#2835](https://github.com/cheminfo/nmrium/issues/2835)
* refresh local molecule state after past a new one ([1162900](https://github.com/cheminfo/nmrium/commit/1162900969ac8980ed5574dd7a383b30f44b0394))
* refresh the X domain after hiding all spectra and then showing one ([b7a80af](https://github.com/cheminfo/nmrium/commit/b7a80af25d6a06bc2f642b1ed1f013d2086a19ef))
* remove empty values from search key array ([7fe44d2](https://github.com/cheminfo/nmrium/commit/7fe44d2035745388a34184523444c9896e210d83)), closes [#2831](https://github.com/cheminfo/nmrium/issues/2831)
* set a fixed virtual scrolling height for spectra table rows ([15084d7](https://github.com/cheminfo/nmrium/commit/15084d790b632667455ef0fad5acf89264b277e9)), closes [#2824](https://github.com/cheminfo/nmrium/issues/2824)
* validate spin system data ([47c5fba](https://github.com/cheminfo/nmrium/commit/47c5fbaa7a1a656fbb02e14f1c5f390f533eb79c))

## [0.47.0](https://github.com/cheminfo/nmrium/compare/v0.46.1...v0.47.0) (2024-01-11)


### Features

* custom color schema validation ([cb0fa8c](https://github.com/cheminfo/nmrium/commit/cb0fa8c6504668be5a81f20e9ac5b4d7a847d749))
* customize the color scheme for spectra ([cb0fa8c](https://github.com/cheminfo/nmrium/commit/cb0fa8c6504668be5a81f20e9ac5b4d7a847d749)), closes [#2794](https://github.com/cheminfo/nmrium/issues/2794)
* show/hide the value of integrals ([f2a0ce3](https://github.com/cheminfo/nmrium/commit/f2a0ce3bafd1424277b6e5689ce3e3ba99ac6a4b)), closes [#2797](https://github.com/cheminfo/nmrium/issues/2797)


### Bug Fixes

* add missing peaks when use multiplet-analysis ([#2814](https://github.com/cheminfo/nmrium/issues/2814)) ([12d03b8](https://github.com/cheminfo/nmrium/commit/12d03b85a12085593210dcd986a2f6c1522ca8f1))
* disable/enable filter ([dbab8f8](https://github.com/cheminfo/nmrium/commit/dbab8f893c84e0a76f446475f5c63a1c066fb95e))

## [0.46.1](https://github.com/cheminfo/nmrium/compare/v0.46.0...v0.46.1) (2023-12-19)


### Bug Fixes

* Blueprint-related warnings ([#2808](https://github.com/cheminfo/nmrium/issues/2808)) ([6618ec1](https://github.com/cheminfo/nmrium/commit/6618ec1f26eec0a2c22bda4a17aae6e5f218c0cc))
* combined approach in manual range picking ([51f88dd](https://github.com/cheminfo/nmrium/commit/51f88ddad070a9e2474f075de49206805443db99))
* resizing range to the same size should not add a new range ([#2807](https://github.com/cheminfo/nmrium/issues/2807)) ([592fe11](https://github.com/cheminfo/nmrium/commit/592fe11db9bfdbf56f98a810775fe3fae3851c4c))

## [0.46.0](https://github.com/cheminfo/nmrium/compare/v0.45.0...v0.46.0) (2023-12-14)


### Features

* load files in parallel ([82a15d4](https://github.com/cheminfo/nmrium/commit/82a15d4457624dd21848b54dd0148144f910ee5a))
* remap existing assignments when molecule is edited ([#2779](https://github.com/cheminfo/nmrium/issues/2779)) ([840c3e5](https://github.com/cheminfo/nmrium/commit/840c3e50851035678ac49b45f2c85bdfb142e619))


### Bug Fixes

* auto phase correction ([82a15d4](https://github.com/cheminfo/nmrium/commit/82a15d4457624dd21848b54dd0148144f910ee5a))
* auto phase correction ([#2787](https://github.com/cheminfo/nmrium/issues/2787)) ([82a15d4](https://github.com/cheminfo/nmrium/commit/82a15d4457624dd21848b54dd0148144f910ee5a))
* check spectrum has imaginary part before calling xMultiply ([e8d736b](https://github.com/cheminfo/nmrium/commit/e8d736b879410aecb71c34467106b95462d5ab59))
* could loose assignement of expanded hydrogens ([#2793](https://github.com/cheminfo/nmrium/issues/2793)) ([cde96e1](https://github.com/cheminfo/nmrium/commit/cde96e1d15c8763e8b02a7dccb2c992ad6f89a8a))
* filter out bruker experiments without required files to process ([a40c318](https://github.com/cheminfo/nmrium/commit/a40c318a0b3bff9eebcd8ffe7954d4a96b923011))
* inverted fft spectrum-migration to 6 version ([#2766](https://github.com/cheminfo/nmrium/issues/2766)) ([1995e6d](https://github.com/cheminfo/nmrium/commit/1995e6dde22829170c0108ec36192a94bc44f4de))
* large negative spectra peak scale ([3262b0d](https://github.com/cheminfo/nmrium/commit/3262b0daabbcd3bbdcd68c685ad41d2f6afe0b80)), closes [#1657](https://github.com/cheminfo/nmrium/issues/1657)
* large negative spectra peak scale ([19fd560](https://github.com/cheminfo/nmrium/commit/19fd560c3ec9991e788e5afc8fbe3b6dc32f3479)), closes [#1657](https://github.com/cheminfo/nmrium/issues/1657)
* negative peak picking ([c35089f](https://github.com/cheminfo/nmrium/commit/c35089fe984cee6fe7db759e093d6262170ad39a))
* render the info value correctly in the info block ([d51ce3d](https://github.com/cheminfo/nmrium/commit/d51ce3d7630e3984304207c039513aceb923a051))
* set the first FT spectrum for 2d projection if none selected ([#2770](https://github.com/cheminfo/nmrium/issues/2770)) ([2d3fcd8](https://github.com/cheminfo/nmrium/commit/2d3fcd85cce855671a93a15fe1476d9f04ec07fd))
* title block field filter ([0345ccb](https://github.com/cheminfo/nmrium/commit/0345ccbd070b3952ebde55f871769cca4ff6c4a9)), closes [#2778](https://github.com/cheminfo/nmrium/issues/2778)
* update react-science with Modal fix ([5a74af1](https://github.com/cheminfo/nmrium/commit/5a74af1d3137f07f245ec415266459d42785fb04))
* zero filling size list ([d44f519](https://github.com/cheminfo/nmrium/commit/d44f51972c5458c88643baffe0e511ebe66a1949))
* zoom out ([76fb39b](https://github.com/cheminfo/nmrium/commit/76fb39b1c5368cd7946aa7a75b719c001778629d))

## [0.45.0](https://github.com/cheminfo/nmrium/compare/v0.44.0...v0.45.0) (2023-11-24)


### ⚠ BREAKING CHANGES

* The NMRium component is no longer rendered inside an isolated shadow DOM. I depends on a style reset such as the one done by TailwindCSS (available in `react-science/styles/preflight.css`) to function correctly.
* remove commonJS build and update TS to 5.2 ([#2670](https://github.com/cheminfo/nmrium/issues/2670))

### Features

* change mouse event to pointer event ([5f65a4c](https://github.com/cheminfo/nmrium/commit/5f65a4cb5ffa1b6375ebcfe3887aedc36f8aa43d))
* delete the phase correction trace ([0a8331d](https://github.com/cheminfo/nmrium/commit/0a8331d28129a52afc116033402ba7dc11d8d405))
* display spectrum vertically for the vertical phase correction ([af0d95b](https://github.com/cheminfo/nmrium/commit/af0d95b7e18735f43ac4214113fc32cb5f6ecd5c))
* hide the integrals within ranges by default ([7257d84](https://github.com/cheminfo/nmrium/commit/7257d84649b68e1b6ac772cd1ef0044826064dc8)), closes [#2656](https://github.com/cheminfo/nmrium/issues/2656)
* hide the peaks within ranges by default ([5492f8a](https://github.com/cheminfo/nmrium/commit/5492f8a848392c92d0ee01f2c968ebdce2c523f9))
* oxford instrument jcamp by filters ([#2706](https://github.com/cheminfo/nmrium/issues/2706)) ([42bc8e8](https://github.com/cheminfo/nmrium/commit/42bc8e82144715d8babfae31adc3e24641bd4984))
* phase correction 1d traces ([6b88bc4](https://github.com/cheminfo/nmrium/commit/6b88bc4b9b36b11e348e2ff94770ce0db056ca05))
* phase correction traces for both directions ([c625982](https://github.com/cheminfo/nmrium/commit/c6259822dfa5c8455e15dc9c815bd20389d583bf))
* scale 2D phase correction traces ([9cb5a1f](https://github.com/cheminfo/nmrium/commit/9cb5a1f7c73c37b9a132f84483487de53684c565))
* set two dimension pivot point ([f530827](https://github.com/cheminfo/nmrium/commit/f5308277be6a137b5fc54fc579bd4f2d9f1c637a))
* spectra multiple analysis chart ([8cd9122](https://github.com/cheminfo/nmrium/commit/8cd9122b91488e44be68e078f9033e0133c8f560))


### Bug Fixes

* add peaks in manual range picking ([#2668](https://github.com/cheminfo/nmrium/issues/2668)) ([50de770](https://github.com/cheminfo/nmrium/commit/50de770729ac86bec9dbd680aef57ae214d1319f))
* add range with no signals ([#2703](https://github.com/cheminfo/nmrium/issues/2703)) ([0365fdf](https://github.com/cheminfo/nmrium/commit/0365fdfe584949422b8d84a85d530dc44dcb2a89)), closes [#2687](https://github.com/cheminfo/nmrium/issues/2687)
* build esm, not cjs ([#2712](https://github.com/cheminfo/nmrium/issues/2712)) ([00ac175](https://github.com/cheminfo/nmrium/commit/00ac17505475ac151ddca9b5da20e66e13114edb))
* correct ranges-preferences to generate acs string ([#2684](https://github.com/cheminfo/nmrium/issues/2684)) ([d7c2dc1](https://github.com/cheminfo/nmrium/commit/d7c2dc1a8bd8a4236b5cf49aa02cc73929ac5076))
* detect negative in auto range picking ([#2719](https://github.com/cheminfo/nmrium/issues/2719)) ([86530ac](https://github.com/cheminfo/nmrium/commit/86530ac4c9d0a8204f16d83521e090ba6e4649db))
* display title block correctly in Safari ([a281edd](https://github.com/cheminfo/nmrium/commit/a281edd802b499f56ab59b7b99c00c0edd99e52b)), closes [#2677](https://github.com/cheminfo/nmrium/issues/2677)
* Fid plotting ([b67dfe7](https://github.com/cheminfo/nmrium/commit/b67dfe7241f77c52517bd86cfa66ae325e5e8634))
* filter spectrum columns correctly ([785850a](https://github.com/cheminfo/nmrium/commit/785850ac1cbd061e5cf3dfb6b98f683f199cb15a)), closes [#2675](https://github.com/cheminfo/nmrium/issues/2675)
* generating real data in the vertical slicing ([7991f19](https://github.com/cheminfo/nmrium/commit/7991f19d85db8008fa30bc059fbc27f13df4b01e)), closes [#2693](https://github.com/cheminfo/nmrium/issues/2693)
* integrals vertical zooms ([cacfff4](https://github.com/cheminfo/nmrium/commit/cacfff4a4e738c3be9eac333342b345b21b7e4e2))
* jcamp tree filtering n wrong scale on F1 ([#2761](https://github.com/cheminfo/nmrium/issues/2761)) ([72447eb](https://github.com/cheminfo/nmrium/commit/72447eb8639d2e95b77ec87e166095657baece59))
* load jcamp files correctly ([#2752](https://github.com/cheminfo/nmrium/issues/2752)) ([1a32500](https://github.com/cheminfo/nmrium/commit/1a325000aff031cd1d7115859567324f7c08b592)), closes [#2751](https://github.com/cheminfo/nmrium/issues/2751)
* load spectrum n assignment from jcamp ([#2754](https://github.com/cheminfo/nmrium/issues/2754)) ([c8bee9c](https://github.com/cheminfo/nmrium/commit/c8bee9c92ede5fd32cf7a03dc55d0c8e5b6bf7b2))
* manual peak picking pointer head position ([4dfa666](https://github.com/cheminfo/nmrium/commit/4dfa66682a5cd4e0a9ce1f37cbb02256ea142ab9))
* open the log history automatically if we have error or fatal ([5c7629e](https://github.com/cheminfo/nmrium/commit/5c7629eeddac7276beb05b641fda210d900b0815)), closes [#2755](https://github.com/cheminfo/nmrium/issues/2755)
* phase correction 2D slices ([#2748](https://github.com/cheminfo/nmrium/issues/2748)) ([110998a](https://github.com/cheminfo/nmrium/commit/110998a7cf38344a38df2e7d0c07255e0a9a5773))
* read gyromagnetic ratio correctly ([db978d9](https://github.com/cheminfo/nmrium/commit/db978d95ffab5ad2cb73f517d8d2820a272beb75))
* resolve the conflict of the analysis modal correctly ([#2727](https://github.com/cheminfo/nmrium/issues/2727)) ([fe6a81c](https://github.com/cheminfo/nmrium/commit/fe6a81c84413ff6120e8e24b0a8553e63fcfe4a7))
* set active spectra ([4f0626b](https://github.com/cheminfo/nmrium/commit/4f0626b3c01ab19ea690beb8822e1674e256eec3))
* shift spectrum 2D ([#2744](https://github.com/cheminfo/nmrium/issues/2744)) ([bd77ab4](https://github.com/cheminfo/nmrium/commit/bd77ab4c61b4efda212c194babfa105f79bfd57b))
* slicing 1d left trace clip width  and its container's  zindex ([f7e976a](https://github.com/cheminfo/nmrium/commit/f7e976a81834aa678a4b0e48814a013c8a5abbe8))
* support nmredata extension ([#2692](https://github.com/cheminfo/nmrium/issues/2692)) ([a2736cf](https://github.com/cheminfo/nmrium/commit/a2736cf322edd872289c7e41ec504fdffcb00ae8))
* traces ([0a8331d](https://github.com/cheminfo/nmrium/commit/0a8331d28129a52afc116033402ba7dc11d8d405))


### Miscellaneous Chores

* remove commonJS build and update TS to 5.2 ([#2670](https://github.com/cheminfo/nmrium/issues/2670)) ([82c871c](https://github.com/cheminfo/nmrium/commit/82c871c91ee8f02db393608e61abca5c2745f11a))
* update react-science ([#2700](https://github.com/cheminfo/nmrium/issues/2700)) ([f918969](https://github.com/cheminfo/nmrium/commit/f918969057d5afea1d6ad21117032b9355dfe010))

## [0.44.0](https://github.com/cheminfo/nmrium/compare/v0.43.0...v0.44.0) (2023-09-13)


### ⚠ BREAKING CHANGES

* rename key prefix 'origin' to 'original'

### Features

* control the visibility of NMRium header items ([7a24c77](https://github.com/cheminfo/nmrium/commit/7a24c779adb15e310a99378a376fe9c473d75ce4))
* delete range peak ([045418d](https://github.com/cheminfo/nmrium/commit/045418d20e4811998ab73b7c8ae3f26d8e420ec6))
* display ranges peaks ([5655c02](https://github.com/cheminfo/nmrium/commit/5655c020fbeeab71ca5a6813877c631145793705))
* helper function to create action column ([123377c](https://github.com/cheminfo/nmrium/commit/123377cb6bb15b8655d7b43242f6c21c5e08f948))
* improve bruker files loading ([#2662](https://github.com/cheminfo/nmrium/issues/2662)) ([d3d231f](https://github.com/cheminfo/nmrium/commit/d3d231f0b9cdce41e1b28820de278d35bf07d254))
* improve peaks and integrals preferences ([123377c](https://github.com/cheminfo/nmrium/commit/123377cb6bb15b8655d7b43242f6c21c5e08f948))
* improve ranges preferences ([a8b397f](https://github.com/cheminfo/nmrium/commit/a8b397fe573fb033eb8e343badeef52265a561bc))
* improve signal kinds for ranges and integrals ([a8ca174](https://github.com/cheminfo/nmrium/commit/a8ca174863b498fc78b99b21702e9da3dcf9e7dd)), closes [#2600](https://github.com/cheminfo/nmrium/issues/2600)
* improve zones preferences ([4966d90](https://github.com/cheminfo/nmrium/commit/4966d90b6fc9e5117d3a33bf11700fc00daa55db))
* toggle 'ranges peaks' visibility and displaying mode ([133de16](https://github.com/cheminfo/nmrium/commit/133de16bc499b7fbd683d8ade8dc62a09d9db956))
* validate the option and the spectra based on the selected options ([f5eb365](https://github.com/cheminfo/nmrium/commit/f5eb365fa50f5205879d5b21758aae1dfb83d37f))


### Bug Fixes

* check peaks array before mapping ([a43bfb7](https://github.com/cheminfo/nmrium/commit/a43bfb7c0ad0e7d928844abc202b1803465ff7c1))
* consecutive selection ([53fff90](https://github.com/cheminfo/nmrium/commit/53fff90b3f3fe28cc69fe7531b34e719db63949d)), closes [#2664](https://github.com/cheminfo/nmrium/issues/2664)
* define sum options for ranges and integrals when initiating the spectrum ([d1fc56f](https://github.com/cheminfo/nmrium/commit/d1fc56fb24db69c600ae9ec053d86f927112264d))
* do not raise an error if no 1D trace spectra are found ([ac56101](https://github.com/cheminfo/nmrium/commit/ac5610169be72ad4d14fbaa2a45991ca38378289)), closes [#2643](https://github.com/cheminfo/nmrium/issues/2643)
* extract the number correctly from the editable column value ([0e11fd6](https://github.com/cheminfo/nmrium/commit/0e11fd6dbd88888b76a4e2e411e0d37de39fea4a))
* full zoom out ([#2640](https://github.com/cheminfo/nmrium/issues/2640)) ([ff0361f](https://github.com/cheminfo/nmrium/commit/ff0361f829b5919409ba23fb915de1c63239d2d8)), closes [#2639](https://github.com/cheminfo/nmrium/issues/2639)
* integrals in fid data ([1291818](https://github.com/cheminfo/nmrium/commit/12918182c102f46b5c4d65442c3061fdd6466b9d))
* recalculate integration when toggling or deleting filter ([81d4388](https://github.com/cheminfo/nmrium/commit/81d43886b2f6c9836552720ce8baabd6b54d60d7)), closes [#2637](https://github.com/cheminfo/nmrium/issues/2637)
* reduce min resolution for smart range picking ([#2630](https://github.com/cheminfo/nmrium/issues/2630)) ([f01d0e4](https://github.com/cheminfo/nmrium/commit/f01d0e4a4f372e33cbac146925982a4d59182cf6))
* spectra calibration ([f5eb365](https://github.com/cheminfo/nmrium/commit/f5eb365fa50f5205879d5b21758aae1dfb83d37f)), closes [#2566](https://github.com/cheminfo/nmrium/issues/2566)


### Code Refactoring

* rename key prefix 'origin' to 'original' ([adfe8d3](https://github.com/cheminfo/nmrium/commit/adfe8d384ae5b1253b2deac17d36eb7153c252ef))

## [0.43.0](https://github.com/cheminfo/nmrium/compare/v0.42.0...v0.43.0) (2023-08-17)


### ⚠ BREAKING CHANGES

* NMRium is now a named export and some types were renamed for consistency

### Features

* 2d Fourier transform ([#2294](https://github.com/cheminfo/nmrium/issues/2294)) ([40e1a4f](https://github.com/cheminfo/nmrium/commit/40e1a4fc509cccab65cf5f4572ce424f5c27b243))
* add integrals from Bruker 1D data ([#2599](https://github.com/cheminfo/nmrium/issues/2599)) ([0c5fda5](https://github.com/cheminfo/nmrium/commit/0c5fda550e2226315eefe7ba1f39ecfc569c1d49))
* add molecule labels and improve speed of molecules ([#2623](https://github.com/cheminfo/nmrium/issues/2623)) ([ce9c7b9](https://github.com/cheminfo/nmrium/commit/ce9c7b983cce6b76563aafddd0ba152a478e0ef5))
* add new way to display peaks ([#2562](https://github.com/cheminfo/nmrium/issues/2562)) ([12e88a1](https://github.com/cheminfo/nmrium/commit/12e88a15a5566c8c3752d089ba49c67b18c6fb69))
* cut integral ([6ea9103](https://github.com/cheminfo/nmrium/commit/6ea91037732ea42e841294516d5c3cb211f900a3))
* cut range ([3a8856d](https://github.com/cheminfo/nmrium/commit/3a8856d1a54e3e4923c7c0984b507e210fbd094e))
* hook for enabling/disabling resizing with Shift key modifier ([eb477d9](https://github.com/cheminfo/nmrium/commit/eb477d9b6f17540e6abe0850d7668a3f8d60b137))
* key modifiers listener ([06f56ea](https://github.com/cheminfo/nmrium/commit/06f56ea05de1842d1f6370606644f29abda25dc8))
* perform resizing only when Shift key is not active ([ac14483](https://github.com/cheminfo/nmrium/commit/ac14483a23acb8793ed55eb826282d417b4ec020)), closes [#2570](https://github.com/cheminfo/nmrium/issues/2570)
* report error contains debug state ([#2555](https://github.com/cheminfo/nmrium/issues/2555)) ([05e40c0](https://github.com/cheminfo/nmrium/commit/05e40c0d1cdc1a58743b6d7bfbf7cac8ce7c998b))
* show label under floating molecules ([#2554](https://github.com/cheminfo/nmrium/issues/2554)) ([5c2ba0d](https://github.com/cheminfo/nmrium/commit/5c2ba0d26e1199ea447cf17089f8df612ec0f30f))


### Bug Fixes

* 2d shift filter ([#2594](https://github.com/cheminfo/nmrium/issues/2594)) ([b63fe93](https://github.com/cheminfo/nmrium/commit/b63fe933f489d227f35ef3754db590dec13f25c8)), closes [#2591](https://github.com/cheminfo/nmrium/issues/2591)
* correct the integration sum for integrals and ranges ([#2617](https://github.com/cheminfo/nmrium/issues/2617)) ([7977041](https://github.com/cheminfo/nmrium/commit/7977041923451c7c75bf0423facb3b923562cc5f))
* do not render two buttons in ChangeSumModal ([3f273d2](https://github.com/cheminfo/nmrium/commit/3f273d2d4ec859516a771e8db02892341009c5e5))
* filters live preview ([#2620](https://github.com/cheminfo/nmrium/issues/2620)) ([b798502](https://github.com/cheminfo/nmrium/commit/b7985021d93d73f15e18d35064f4818fb5d2eb68))
* improve prediction ([#2613](https://github.com/cheminfo/nmrium/issues/2613)) ([5f35c00](https://github.com/cheminfo/nmrium/commit/5f35c0060afb312ced3a4be08c36426e3fb1402d))
* load good ones and catch error in the logger ([#2616](https://github.com/cheminfo/nmrium/issues/2616)) ([4413975](https://github.com/cheminfo/nmrium/commit/44139757f34a04fb9b74944dc9670224a9af3c67))
* update react-science ([#2593](https://github.com/cheminfo/nmrium/issues/2593)) ([795ace9](https://github.com/cheminfo/nmrium/commit/795ace9f65142d7e0e2319e122929daf65b9195f))


### Code Refactoring

* move public types to their own file ([a921a8b](https://github.com/cheminfo/nmrium/commit/a921a8bf6f8285bc3dd1eaccae2ae28ba253aa6d))

## [0.42.0](https://github.com/cheminfo/nmrium/compare/v0.41.0...v0.42.0) (2023-07-27)


### Features

* create Scroller component ([128662e](https://github.com/cheminfo/nmrium/commit/128662e3630fc2b24aae02d1fe8fb01b55a1166f))
* format the number fields in the info block ([#2546](https://github.com/cheminfo/nmrium/issues/2546)) ([0e81e02](https://github.com/cheminfo/nmrium/commit/0e81e0237308acaca6b2f305d2ad67792668e14c))
* paste / import a list of structures ([#2544](https://github.com/cheminfo/nmrium/issues/2544)) ([f092df6](https://github.com/cheminfo/nmrium/commit/f092df68d42a6793f0fd1312dbce1d828420841b)), closes [#2382](https://github.com/cheminfo/nmrium/issues/2382)
* scroll to the active nucleus spectra preferences ([d71db46](https://github.com/cheminfo/nmrium/commit/d71db4609cf8dcc7a30dc0ac3846f19f8fc6fd72)), closes [#2547](https://github.com/cheminfo/nmrium/issues/2547)


### Bug Fixes

* clamp SVG paths to avoid rendering issues ([#2551](https://github.com/cheminfo/nmrium/issues/2551)) ([b8fe1a4](https://github.com/cheminfo/nmrium/commit/b8fe1a42d7e0df9050a6d932def0fb1a89422b91))
* save new workspace ([#2541](https://github.com/cheminfo/nmrium/issues/2541)) ([93cabc8](https://github.com/cheminfo/nmrium/commit/93cabc86a3bff97dbbc75f0b8262b456b363054c))
* search should be by ideCode beside the other criteria ([0e18164](https://github.com/cheminfo/nmrium/commit/0e18164cd388a3ffd484fb228e6ddc7c20f8903c))
* use spectralWidth as an option to spectralWidthClipped jeol ([#2553](https://github.com/cheminfo/nmrium/issues/2553)) ([95de3b0](https://github.com/cheminfo/nmrium/commit/95de3b09be824c8c844a19715e424073da265d14))

## [0.41.0](https://github.com/cheminfo/nmrium/compare/v0.40.1...v0.41.0) (2023-07-22)


### Features

* 1D pan horizontally and 2D pan vertically and horizontally ([#2498](https://github.com/cheminfo/nmrium/issues/2498)) ([594e791](https://github.com/cheminfo/nmrium/commit/594e79193b5d32064e40ab2aabdcd9f08a911c02))
* 1d spectrum simulation ([#2513](https://github.com/cheminfo/nmrium/issues/2513)) ([caf4cbd](https://github.com/cheminfo/nmrium/commit/caf4cbd31bbd146447c755a4242cb759b6f6617a))
* add the "frequency" and spin system as "name" to the simulated spectrum info  ([#2530](https://github.com/cheminfo/nmrium/issues/2530)) ([21b1e1b](https://github.com/cheminfo/nmrium/commit/21b1e1b47d370a6aec6d615b0e22873d2b9b3c56))
* create a workspace for simulation  ([#2532](https://github.com/cheminfo/nmrium/issues/2532)) ([1ca5910](https://github.com/cheminfo/nmrium/commit/1ca59100ab8358810ee3baf823dd56825e3e7182)), closes [#2527](https://github.com/cheminfo/nmrium/issues/2527)


### Bug Fixes

* autoExtendRange option and logs for simulation with signals are out of range. ([#2507](https://github.com/cheminfo/nmrium/issues/2507)) ([31c3844](https://github.com/cheminfo/nmrium/commit/31c3844cdeacdc3ce34458386a41a388686ab891))
* baseline correction zones visibility ([0f27e2f](https://github.com/cheminfo/nmrium/commit/0f27e2f45efdb928e0fddf7a7fed810709a981aa)), closes [#2348](https://github.com/cheminfo/nmrium/issues/2348)
* integral value editing if the sum 0 ([#2464](https://github.com/cheminfo/nmrium/issues/2464)) ([e6d6e0a](https://github.com/cheminfo/nmrium/commit/e6d6e0a31c1fe674e95fc05f54c56f5b00ae24e9))
* manual range multiplicity ([#2535](https://github.com/cheminfo/nmrium/issues/2535)) ([9aa7cd2](https://github.com/cheminfo/nmrium/commit/9aa7cd2a9f1c4121176f22c073d72e85b7d039e2))
* preferFt bruker data filtering was not working for 2D ([#2538](https://github.com/cheminfo/nmrium/issues/2538)) ([3663544](https://github.com/cheminfo/nmrium/commit/36635440383cffe07ea9f3a8ef61ad1c221496ce))
* prevent clearing the molecule from the structure editor after changing the settings ([8cb98a3](https://github.com/cheminfo/nmrium/commit/8cb98a3630c9722d8138bd7d3922c079650810c7)), closes [#2512](https://github.com/cheminfo/nmrium/issues/2512)
* unexpected errors in reducer crashing the app ([dbd2b8c](https://github.com/cheminfo/nmrium/commit/dbd2b8c8570955d8623c30a52e0d70e28f5875f2))
* update frequency for the simulated spectrum ([#2534](https://github.com/cheminfo/nmrium/issues/2534)) ([23958a0](https://github.com/cheminfo/nmrium/commit/23958a08c84c1982c6750733cf499c0e6d53dbad)), closes [#2533](https://github.com/cheminfo/nmrium/issues/2533)

## [0.40.1](https://github.com/cheminfo/nmrium/compare/v0.40.0...v0.40.1) (2023-07-06)


### Bug Fixes

* **release:** trigger new release ([#2501](https://github.com/cheminfo/nmrium/issues/2501)) ([5ba9c07](https://github.com/cheminfo/nmrium/commit/5ba9c07262557754d29b36704f94d355236eeb75))

## [0.40.0](https://github.com/cheminfo/nmrium/compare/v0.39.0...v0.40.0) (2023-07-06)


### Features

* open logger dialog automatically ([b80a2d1](https://github.com/cheminfo/nmrium/commit/b80a2d1c88969632ef00c83d0b88924488156d4f)), closes [#2485](https://github.com/cheminfo/nmrium/issues/2485)


### Bug Fixes

* some modal sizes ([#2377](https://github.com/cheminfo/nmrium/issues/2377)) ([7d114d9](https://github.com/cheminfo/nmrium/commit/7d114d9aede5e7acadaeee64eeb768519df116e5))
* unhandled error when clipboard read permissions are not granted ([#2492](https://github.com/cheminfo/nmrium/issues/2492)) ([41b4cd8](https://github.com/cheminfo/nmrium/commit/41b4cd885839be9ee251af4c45bb9d8177226521))

## [0.39.0](https://github.com/cheminfo/nmrium/compare/v0.38.2...v0.39.0) (2023-06-30)


### Features

* add low res prediction ([#2478](https://github.com/cheminfo/nmrium/issues/2478)) ([44ff57e](https://github.com/cheminfo/nmrium/commit/44ff57e89f4e746ed8950c3acb269b8e5f3c50e5))
* allow to render NMRium without error boundary ([#2489](https://github.com/cheminfo/nmrium/issues/2489)) ([8bde9b9](https://github.com/cheminfo/nmrium/commit/8bde9b9a31f6d730fe8502a3371f6088f3b82285))


### Bug Fixes

* close the 'range editing' model of the range or spectra deleted ([0bc6183](https://github.com/cheminfo/nmrium/commit/0bc61839c1b177676a66ef397e28b1684f214ccb))
* extract and check id object correctly ([56ec65a](https://github.com/cheminfo/nmrium/commit/56ec65a5ed3a4e10026eadacdce970ebd88c5d03))
* log errors to the console to help debugging ([#2486](https://github.com/cheminfo/nmrium/issues/2486)) ([89cccd1](https://github.com/cheminfo/nmrium/commit/89cccd1c1be7e17cc51e5b28ca8325a16da6cd91))
* manual zones detection for predicted 2D spectra ([#2487](https://github.com/cheminfo/nmrium/issues/2487)) ([8da944b](https://github.com/cheminfo/nmrium/commit/8da944b790a29ac8c5a3ed9c34342e36b8b36e25))
* peaks and integrals panels should be visible only in 1D mode ([dded4f4](https://github.com/cheminfo/nmrium/commit/dded4f40484d4b8d03b6c7f84c8832fd56af8798))
* reset the selected tool to zoom when switching between spectra or nuclei ([eee03ca](https://github.com/cheminfo/nmrium/commit/eee03cafe40ab4bdffb26a3a4ddcd2a6848b3c1e))
* set preferences ([24d7613](https://github.com/cheminfo/nmrium/commit/24d7613927b6beb2dc20a68e8da0eba17c740188))
* simulate spectra with negative chemical shift and catch some errors ([#2488](https://github.com/cheminfo/nmrium/issues/2488)) ([e677e06](https://github.com/cheminfo/nmrium/commit/e677e0622368b7fec5aa9832042ce90b38acb37c))
* spectra zones detection should be only on FT 2D spectra ([293d2fb](https://github.com/cheminfo/nmrium/commit/293d2fb8678eb31b004f1b6bb63bee0bce4bde45))
* validate JCAMP file URL correctly ([82b4c42](https://github.com/cheminfo/nmrium/commit/82b4c427591ade7ea4fdbb8bb441ab6778a8c599))

## [0.38.2](https://github.com/cheminfo/nmrium/compare/v0.38.1...v0.38.2) (2023-06-22)


### Bug Fixes

* auto (peaks and ranges) picking  window size ([2b6a045](https://github.com/cheminfo/nmrium/commit/2b6a0454e01e532344c4e3da35705a700d194f39))
* check 'delta' is exists before call the toFixed function ([#2437](https://github.com/cheminfo/nmrium/issues/2437)) ([b46f6ec](https://github.com/cheminfo/nmrium/commit/b46f6eceab35ad2adaf66e5f422256ede2b62a85))
* check for the nucleus before extracting info from the atom ([fecc3f8](https://github.com/cheminfo/nmrium/commit/fecc3f8e96e354c73b4b3d02aa58e178f9e9f65d))
* check the meta file has an accepted mimeType ([#2445](https://github.com/cheminfo/nmrium/issues/2445)) ([2974e54](https://github.com/cheminfo/nmrium/commit/2974e54ddfa3c9b68e637e99a1f61c4cb2e23152)), closes [#2418](https://github.com/cheminfo/nmrium/issues/2418)
* disable the 'preview publication string' button when no ranges ([0d5b6b7](https://github.com/cheminfo/nmrium/commit/0d5b6b7ff09c6a373a1400821098d41528dcc110))
* display react-table empty row correctly ([443f62e](https://github.com/cheminfo/nmrium/commit/443f62edfb8dfc6d8270ec31838de15ce9b292bf))
* do not prevent triggering onChange when props are changed ([37dadf8](https://github.com/cheminfo/nmrium/commit/37dadf8addff251795dd93c2c181528a0cf3f888))
* hide spectrum settings dialog if it's 2d Fid ([5a780f6](https://github.com/cheminfo/nmrium/commit/5a780f691ea524d431b1c4e89a4d43224d6f9d6b)), closes [#2424](https://github.com/cheminfo/nmrium/issues/2424)
* jcamp-dx generation n move filters to nmr-processing ([#2386](https://github.com/cheminfo/nmrium/issues/2386)) ([470abab](https://github.com/cheminfo/nmrium/commit/470abab98a53a6ddee6bc93818b0cff90a41bdfb))

## [0.38.1](https://github.com/cheminfo/nmrium/compare/v0.38.0...v0.38.1) (2023-06-09)


### Bug Fixes

* parse jcamp URL correctly ([#2407](https://github.com/cheminfo/nmrium/issues/2407)) ([714f1a6](https://github.com/cheminfo/nmrium/commit/714f1a66145879793f16313ab6ac606440c4fd4a))
* spectra prediction ([#2408](https://github.com/cheminfo/nmrium/issues/2408)) ([45c52ba](https://github.com/cheminfo/nmrium/commit/45c52bab522b0ed8941c325510b4281885d10862))

## [0.38.0](https://github.com/cheminfo/nmrium/compare/v0.37.0...v0.38.0) (2023-06-08)


### Features

* include 'view' object with the normal save ([#2388](https://github.com/cheminfo/nmrium/issues/2388)) ([f69d213](https://github.com/cheminfo/nmrium/commit/f69d2137597be577c4f5a57e356f82e93149d914))
* rename metaInfo to customInfo and reorder information panel ([#2380](https://github.com/cheminfo/nmrium/issues/2380)) ([1731ce4](https://github.com/cheminfo/nmrium/commit/1731ce493da010495ee03adfce1e2f077dd2eed9))


### Bug Fixes

* correctly determine if a molecule is empty ([#2403](https://github.com/cheminfo/nmrium/issues/2403)) ([72e6979](https://github.com/cheminfo/nmrium/commit/72e69792bb97820cddb28d7b7e712c19ba114d4e)), closes [#2400](https://github.com/cheminfo/nmrium/issues/2400)
* do not use p element in NoData component ([#2401](https://github.com/cheminfo/nmrium/issues/2401)) ([f86d42c](https://github.com/cheminfo/nmrium/commit/f86d42cda9502eb2e1b7a0da8137ad80ac69b2af))
* manual 'add range' crash when no spectrum is selected ([#2399](https://github.com/cheminfo/nmrium/issues/2399)) ([3ab5514](https://github.com/cheminfo/nmrium/commit/3ab5514f7563b78fe4c467aa686f322e385a4c95)), closes [#2390](https://github.com/cheminfo/nmrium/issues/2390)
* manual coupling edition ([#2384](https://github.com/cheminfo/nmrium/issues/2384)) ([fb8b576](https://github.com/cheminfo/nmrium/commit/fb8b576aac7abecbf2cd4a0cfce788645857321f)), closes [#2353](https://github.com/cheminfo/nmrium/issues/2353)
* show time domain spectrum if none of the selected spectrum is FT ([#2370](https://github.com/cheminfo/nmrium/issues/2370)) ([480d9de](https://github.com/cheminfo/nmrium/commit/480d9dea4afbc83e0aeb79bc2888f6910252278b))

## [0.37.0](https://github.com/cheminfo/nmrium/compare/v0.36.0...v0.37.0) (2023-05-26)


### Features

* add onError callback to support errors caught by the boundary ([32eea35](https://github.com/cheminfo/nmrium/commit/32eea353b6422a1085ee91425c6fec770f48de54))
* improve 2d assignments ([#2357](https://github.com/cheminfo/nmrium/issues/2357)) ([ff99d1e](https://github.com/cheminfo/nmrium/commit/ff99d1e0f9bc897991c09aa29f459720863c115c))
* improve floating structure initial position ([#2378](https://github.com/cheminfo/nmrium/issues/2378)) ([6312cf9](https://github.com/cheminfo/nmrium/commit/6312cf9eb68fd808d21bba2df70c47f8bdb8f3a7))
* show information about the Spectra prediction ([#2372](https://github.com/cheminfo/nmrium/issues/2372)) ([6ecd8ab](https://github.com/cheminfo/nmrium/commit/6ecd8ab0108e3f807e9fb4f0007de9e6113dc016)), closes [#2367](https://github.com/cheminfo/nmrium/issues/2367)


### Bug Fixes

* processing spectra on load ([#2365](https://github.com/cheminfo/nmrium/issues/2365)) ([15c22b7](https://github.com/cheminfo/nmrium/commit/15c22b739a80bf574a9f0427022e102345c1667b))

## [0.36.0](https://github.com/cheminfo/nmrium/compare/v0.35.0...v0.36.0) (2023-05-18)


### Features

* display assigned indicator on the top of ranges ([#2341](https://github.com/cheminfo/nmrium/issues/2341)) ([eefcaa4](https://github.com/cheminfo/nmrium/commit/eefcaa4546a07b8e63c38ef0d9872fd25beea398)), closes [#2338](https://github.com/cheminfo/nmrium/issues/2338)
* manual zone selection create only one zone/signal ([#2354](https://github.com/cheminfo/nmrium/issues/2354)) ([d6e6232](https://github.com/cheminfo/nmrium/commit/d6e6232768511b9ac264f3728f3df5ee7869028e))


### Bug Fixes

* check symmetry first for manual range picking ([#2339](https://github.com/cheminfo/nmrium/issues/2339)) ([0886f50](https://github.com/cheminfo/nmrium/commit/0886f504497a118ae7f1d1ce899122a50a861a7d))
* manage correctly 19F n 31P jeol data ([#2355](https://github.com/cheminfo/nmrium/issues/2355)) ([e01ffdf](https://github.com/cheminfo/nmrium/commit/e01ffdf896439c2aa9a85573528ddc0b51c73be9))
* normalize nucleus for jeol n varian ([#2356](https://github.com/cheminfo/nmrium/issues/2356)) ([a4acc6b](https://github.com/cheminfo/nmrium/commit/a4acc6b60608f2ffde3a50635c8ccb7b4ed69ef4))
* reverse varian data to avoid inverted spectrum ([#2347](https://github.com/cheminfo/nmrium/issues/2347)) ([34c41b5](https://github.com/cheminfo/nmrium/commit/34c41b5f1d566b6659e9155befe8cd4071b81505))
* spectrum object should include the sourceSelector ([#2360](https://github.com/cheminfo/nmrium/issues/2360)) ([8d9161b](https://github.com/cheminfo/nmrium/commit/8d9161b7cb7713d6880c31fc8bdc73ef8724b679))
* use a central source of possible patterns for multiplicities ([#2352](https://github.com/cheminfo/nmrium/issues/2352)) ([fa4dc72](https://github.com/cheminfo/nmrium/commit/fa4dc72d725b9de76a040aca67426034e71e81e6))

## [0.35.0](https://github.com/cheminfo/nmrium/compare/v0.34.0...v0.35.0) (2023-05-04)


### Features

* add popup title over assign ranges and signals column ([#2332](https://github.com/cheminfo/nmrium/issues/2332)) ([f0cdd50](https://github.com/cheminfo/nmrium/commit/f0cdd501932147bb68c55ac02e15b864e05972ed)), closes [#2312](https://github.com/cheminfo/nmrium/issues/2312)
* export as JCAMP-DX ([#2283](https://github.com/cheminfo/nmrium/issues/2283)) ([7a5f520](https://github.com/cheminfo/nmrium/commit/7a5f520b8e760519b24229000b0a72087dec702c))
* improve assignments ([#2288](https://github.com/cheminfo/nmrium/issues/2288)) ([d861d18](https://github.com/cheminfo/nmrium/commit/d861d1844f055fb7f1180cbf35330e94f427cb29))
* match phase correction to topspin ([#2305](https://github.com/cheminfo/nmrium/issues/2305)) ([e13047d](https://github.com/cheminfo/nmrium/commit/e13047d21533b43bc670fe1b984172dd303dd86b))
* save database product as .nmrium file ([#2273](https://github.com/cheminfo/nmrium/issues/2273)) ([1b103e1](https://github.com/cheminfo/nmrium/commit/1b103e1dee0acbe0eb8bb4c393ac7985d79086b0))
* show a message when the database panel is not available ([#2334](https://github.com/cheminfo/nmrium/issues/2334)) ([d7a555f](https://github.com/cheminfo/nmrium/commit/d7a555f7b7b02383bd3ae845ece817b45ae5c68c))


### Bug Fixes

* actionType should not be empty ([#2319](https://github.com/cheminfo/nmrium/issues/2319)) ([26c573a](https://github.com/cheminfo/nmrium/commit/26c573ac0bea1c2491fa70255407bbee45ddd51f)), closes [#2318](https://github.com/cheminfo/nmrium/issues/2318)
* assignments  ([#2322](https://github.com/cheminfo/nmrium/issues/2322)) ([8a11cda](https://github.com/cheminfo/nmrium/commit/8a11cda333dbb1ad5048dc2fc742596a38132672))
* crash with full cytisine and assignment summary ([#2331](https://github.com/cheminfo/nmrium/issues/2331)) ([c1f29de](https://github.com/cheminfo/nmrium/commit/c1f29de38ceb85bb963dd490316285d8eec18417))
* do not add empty string for name in migration ([#2316](https://github.com/cheminfo/nmrium/issues/2316)) ([e33bcab](https://github.com/cheminfo/nmrium/commit/e33bcab88f9a1fefb3d5c8a42a94caf74a564db1))
* erase setting completely when the settings version changed ([#2323](https://github.com/cheminfo/nmrium/issues/2323)) ([5c1af96](https://github.com/cheminfo/nmrium/commit/5c1af96ac58800f470f64c7b477e4e69fc062601))
* onChange callback debounce ([#2296](https://github.com/cheminfo/nmrium/issues/2296)) ([ec822d8](https://github.com/cheminfo/nmrium/commit/ec822d8c7ed5e0ac95f4a5b2d3f1335584679dfc))
* peak, ranges, and zones picking options input refresh ([#2317](https://github.com/cheminfo/nmrium/issues/2317)) ([6a6ef64](https://github.com/cheminfo/nmrium/commit/6a6ef6448de41c554b8b4ac13ca7bbb202aff302))
* ph0 value starts from zero ([#2315](https://github.com/cheminfo/nmrium/issues/2315)) ([5d08c1a](https://github.com/cheminfo/nmrium/commit/5d08c1a50ae99e93e79cf23be4ca2e08f6d0e450)), closes [#2314](https://github.com/cheminfo/nmrium/issues/2314)
* react-table layout ([#2293](https://github.com/cheminfo/nmrium/issues/2293)) ([d40f76b](https://github.com/cheminfo/nmrium/commit/d40f76baefe4771b0538de1148448e904c2ae1e8))
* spectra intensity change after step out horizontally ([#2281](https://github.com/cheminfo/nmrium/issues/2281)) ([b1aa905](https://github.com/cheminfo/nmrium/commit/b1aa90596561183d90597fd0025e4663d66d3b7f))
* structures labels uniqueness ([#2333](https://github.com/cheminfo/nmrium/issues/2333)) ([3c7126d](https://github.com/cheminfo/nmrium/commit/3c7126de05ff45ab51da489b1f98b839ea12a527)), closes [#2303](https://github.com/cheminfo/nmrium/issues/2303)

## [0.34.0](https://github.com/cheminfo/nmrium/compare/v0.33.0...v0.34.0) (2023-03-24)


### Features

* 2d fid ([#1633](https://github.com/cheminfo/nmrium/issues/1633)) ([1a89ffc](https://github.com/cheminfo/nmrium/commit/1a89ffcac8dde7173e6f92288c6dd3d0539aec21))
* add description for predefined columns ([741646d](https://github.com/cheminfo/nmrium/commit/741646d883990c099e63e096cd96900cb3a6b5c4))
* add importation filters tab to general settings ([#1957](https://github.com/cheminfo/nmrium/issues/1957)) ([7769d6c](https://github.com/cheminfo/nmrium/commit/7769d6c6a48689721e6f07a5746bae034ed8d197)), closes [#1607](https://github.com/cheminfo/nmrium/issues/1607)
* add Matrix generation options per nucleus in the View state ([878910a](https://github.com/cheminfo/nmrium/commit/878910a5dbe46b34af497b461be75b900c6b16f2))
* add signal processing filter ([7ea6416](https://github.com/cheminfo/nmrium/commit/7ea641613ecc8d1cb8478ae4fa960c9c1c28434a))
* add spectra column customization ([741646d](https://github.com/cheminfo/nmrium/commit/741646d883990c099e63e096cd96900cb3a6b5c4))
* add the 'source' property for original file ([#2126](https://github.com/cheminfo/nmrium/issues/2126)) ([c1dbe93](https://github.com/cheminfo/nmrium/commit/c1dbe93b743c32673fe9b239e88d52f88d0bd142))
* auto-complete for spectra objects paths ([6af9af5](https://github.com/cheminfo/nmrium/commit/6af9af502edec5acbf7f77011492b1f10796f4af)), closes [#2045](https://github.com/cheminfo/nmrium/issues/2045)
* change contours levels for all 2d spectra if no spectrum is selected ([#2074](https://github.com/cheminfo/nmrium/issues/2074)) ([ce89796](https://github.com/cheminfo/nmrium/commit/ce89796b16e5e5eb0d5510bfbfc7e730b1a1a2d3)), closes [#2069](https://github.com/cheminfo/nmrium/issues/2069)
* copy and past workspace ([c7c012b](https://github.com/cheminfo/nmrium/commit/c7c012ba64776db6cc9b3408b1da6bd21645b8f2))
* copy molfile as V3 or V2 ([#2201](https://github.com/cheminfo/nmrium/issues/2201)) ([9692f5a](https://github.com/cheminfo/nmrium/commit/9692f5ab646df77cd87a2cf1175e2fa99095fb6c))
* create a new workspace "assignment"  ([#1895](https://github.com/cheminfo/nmrium/issues/1895)) ([c04d6df](https://github.com/cheminfo/nmrium/commit/c04d6df91f3d34b910f4f874319f0886ef29e704))
* custom layout component for svg elements ([f019c0a](https://github.com/cheminfo/nmrium/commit/f019c0a5b4426937eb5861804ca5f52d1df0a663))
* customize spectra legends ([a332ead](https://github.com/cheminfo/nmrium/commit/a332ead8ccd79a208a2160e462f915f92eeba5bc))
* database table scroll position ([#1860](https://github.com/cheminfo/nmrium/issues/1860)) ([2e480a1](https://github.com/cheminfo/nmrium/commit/2e480a15017b1dd5a196373726b1152b320292b5))
* delete all filters under a specific spectrum ([4198f17](https://github.com/cheminfo/nmrium/commit/4198f171551408d244d1301b9eb0d83c5bf8d7d0))
* display matrix generation panel ([#1955](https://github.com/cheminfo/nmrium/issues/1955)) ([d1d326e](https://github.com/cheminfo/nmrium/commit/d1d326ee8e4ebc188cc8f23544ec74566f93c96d)), closes [#1953](https://github.com/cheminfo/nmrium/issues/1953)
* display spectra info block ([1f1cfd8](https://github.com/cheminfo/nmrium/commit/1f1cfd87229a3c24d780b4b2ff92c34ec06abdd4))
* distinguish FT spectrum which processed by NMRium with an icon ([#2157](https://github.com/cheminfo/nmrium/issues/2157)) ([efa979f](https://github.com/cheminfo/nmrium/commit/efa979f257fdfa904f56f5f56d05943e9c65dcb1)), closes [#2149](https://github.com/cheminfo/nmrium/issues/2149)
* field auto complete ([7b3590c](https://github.com/cheminfo/nmrium/commit/7b3590c2820a45bc5ac7162924f87cf7e7de604b))
* fileCollection as source in .nmrium files ([#2022](https://github.com/cheminfo/nmrium/issues/2022)) ([8aad5c6](https://github.com/cheminfo/nmrium/commit/8aad5c6878595c77f080ae5c9ba6686479c95cd9))
* import meta information automatically ([54b48da](https://github.com/cheminfo/nmrium/commit/54b48dad1795b7ccb02946cb420f9596fac7d1e5))
* import spectra meta information ([77ff6a3](https://github.com/cheminfo/nmrium/commit/77ff6a3441be6d439a99526011c18d53516e2536)), closes [#1462](https://github.com/cheminfo/nmrium/issues/1462)
* improve general settings UI ([#1966](https://github.com/cheminfo/nmrium/issues/1966)) ([82a33e8](https://github.com/cheminfo/nmrium/commit/82a33e8790af71461f6574d906e4ae70149d8638))
* improve multiple spectra analysis panel ([#1964](https://github.com/cheminfo/nmrium/issues/1964)) ([93158dd](https://github.com/cheminfo/nmrium/commit/93158ddec4fbffdaff65a2729b43f71c9843586b)), closes [#1921](https://github.com/cheminfo/nmrium/issues/1921)
* improve spectra analysis ([#1987](https://github.com/cheminfo/nmrium/issues/1987)) ([64c029d](https://github.com/cheminfo/nmrium/commit/64c029d3abbe46d0c7c3200fd3cd8c59c1f27d57)), closes [#1980](https://github.com/cheminfo/nmrium/issues/1980)
* integrate with fifo-logger ([#2231](https://github.com/cheminfo/nmrium/issues/2231)) ([0282462](https://github.com/cheminfo/nmrium/commit/02824625bfdad165173dbc78509f09701325e3f2))
* load .nmrium file without spectra ([#2123](https://github.com/cheminfo/nmrium/issues/2123)) ([#2125](https://github.com/cheminfo/nmrium/issues/2125)) ([aff9a4e](https://github.com/cheminfo/nmrium/commit/aff9a4eba8e46210f274053637ee082d80a7adff))
* load .nmrium file without spectra and have iew or, and setting… ([#2123](https://github.com/cheminfo/nmrium/issues/2123)) ([106ad9b](https://github.com/cheminfo/nmrium/commit/106ad9beb17025b2f7d1920807f9414abe9ef18d))
* matrix generation ([53b9832](https://github.com/cheminfo/nmrium/commit/53b9832ec306d6424a9903cd476056108d07b05f))
* message component (success, error, warning, and info) ([653f459](https://github.com/cheminfo/nmrium/commit/653f459a352051a917ea37b7b8489fcdd61585db))
* nmr-load-save prerelease with filters ([#1965](https://github.com/cheminfo/nmrium/issues/1965)) ([f0a9471](https://github.com/cheminfo/nmrium/commit/f0a9471ce568766d5aad0507b4dc4ce77fe6bab8))
* order multiple spectra analysis table ([#1887](https://github.com/cheminfo/nmrium/issues/1887)) ([9f90f13](https://github.com/cheminfo/nmrium/commit/9f90f1354b5f4a9d03b503f0ecea75144bd483d6))
* process FID spectra automatically to FT ([#2141](https://github.com/cheminfo/nmrium/issues/2141)) ([d3b87ad](https://github.com/cheminfo/nmrium/commit/d3b87adaa24ce941b58e8dfac32806a2811a1f3d))
* re-coloring spectra based on the distinct value ([1cdedf9](https://github.com/cheminfo/nmrium/commit/1cdedf9a521f73091afb2937e47a18cd19949c22)), closes [#1882](https://github.com/cheminfo/nmrium/issues/1882)
* react table columns virtual scroll ([2282a75](https://github.com/cheminfo/nmrium/commit/2282a754ba5b47a8247ca8ff041001ab68875c96))
* recolor spectra ([b57ed9d](https://github.com/cheminfo/nmrium/commit/b57ed9d51be64e03edaa9b83d4c70e4829936102)), closes [#2081](https://github.com/cheminfo/nmrium/issues/2081)
* redetect signal when resizing the range ([#2007](https://github.com/cheminfo/nmrium/issues/2007)) ([90d8487](https://github.com/cheminfo/nmrium/commit/90d8487ea0d64a9f4dffdb57abeb13933e8a5fb6))
* resize floating molecule ([52d16e6](https://github.com/cheminfo/nmrium/commit/52d16e6e40cc81a5180c7328cf9a137ee9408cb7)), closes [#1929](https://github.com/cheminfo/nmrium/issues/1929)
* save vertical splitter position in workspace ([#2203](https://github.com/cheminfo/nmrium/issues/2203)) ([b35418f](https://github.com/cheminfo/nmrium/commit/b35418f94417bdd1646ec72b55d9aba82b47389c))
* select multiple active spectra ([#2104](https://github.com/cheminfo/nmrium/issues/2104)) ([0c214a8](https://github.com/cheminfo/nmrium/commit/0c214a81d63097a5198e4591567f5079521117c6))
* set custom workspaces at the level of the NMRium component ([#1956](https://github.com/cheminfo/nmrium/issues/1956)) ([f3b3c65](https://github.com/cheminfo/nmrium/commit/f3b3c65a68f0b0d3260b3714aebad4c5a29f5d4f))
* show a message when drag/drop files raise an error ([#1962](https://github.com/cheminfo/nmrium/issues/1962)) ([9b3c956](https://github.com/cheminfo/nmrium/commit/9b3c95679baa1311b6268106950c32a6c724b0b7))
* show molecule atoms number ([#1918](https://github.com/cheminfo/nmrium/issues/1918)) ([3468b96](https://github.com/cheminfo/nmrium/commit/3468b966caceedbbda5b99a37181941903df08e9)), closes [#1916](https://github.com/cheminfo/nmrium/issues/1916)
* signal processing filter ([4a1bccf](https://github.com/cheminfo/nmrium/commit/4a1bccfe88bc687ccc4d4ba8795f59c4925dc463))
* sort spectra ([fde2fbc](https://github.com/cheminfo/nmrium/commit/fde2fbc2328bac1ae69c2759319e97456443d48b)), closes [#2018](https://github.com/cheminfo/nmrium/issues/2018)
* use 2D data quadrants and reload assignment from JCAMP-DX ([#1861](https://github.com/cheminfo/nmrium/issues/1861)) ([435e961](https://github.com/cheminfo/nmrium/commit/435e961b974da9ca167f699aa67f524dc22c9606))


### Bug Fixes

* add one level in filters ([#2120](https://github.com/cheminfo/nmrium/issues/2120)) ([24b6f36](https://github.com/cheminfo/nmrium/commit/24b6f3673087249a707304614623a4dd8ba75665))
* alert messages are outside the visible page ([#1890](https://github.com/cheminfo/nmrium/issues/1890)) ([221cf24](https://github.com/cheminfo/nmrium/commit/221cf24eab188afb9790d53a41f95a336f23b795)), closes [#1875](https://github.com/cheminfo/nmrium/issues/1875)
* avoid timeout during assignment ([d813541](https://github.com/cheminfo/nmrium/commit/d813541cea903b022e38e04ac3ffdf494123e928))
* avoid unmounts in spectra panel ([#2197](https://github.com/cheminfo/nmrium/issues/2197)) ([fc2f07a](https://github.com/cheminfo/nmrium/commit/fc2f07a27c4604b260736263be423923ae65825d)), closes [#1901](https://github.com/cheminfo/nmrium/issues/1901)
* baseline correction live preview ([#1969](https://github.com/cheminfo/nmrium/issues/1969)) ([c7c012b](https://github.com/cheminfo/nmrium/commit/c7c012ba64776db6cc9b3408b1da6bd21645b8f2))
* coupling constant format in database table ([#1877](https://github.com/cheminfo/nmrium/issues/1877)) ([d72a1a1](https://github.com/cheminfo/nmrium/commit/d72a1a195832a3bcb713afd79cc5185d09a34676)), closes [#1853](https://github.com/cheminfo/nmrium/issues/1853)
* coupling constants format ([#1856](https://github.com/cheminfo/nmrium/issues/1856)) ([4e899e6](https://github.com/cheminfo/nmrium/commit/4e899e6ba7bc33515f952be54f0a4ddea5b3de14))
* digits format  ([#2137](https://github.com/cheminfo/nmrium/issues/2137)) ([fc38f51](https://github.com/cheminfo/nmrium/commit/fc38f51c8c0ef0cb82eb49e47be0bd64b1c114c8))
* dropdown list position ([#2010](https://github.com/cheminfo/nmrium/issues/2010)) ([9545851](https://github.com/cheminfo/nmrium/commit/9545851c33fd889d44168c82704599ee170bbced)), closes [#2008](https://github.com/cheminfo/nmrium/issues/2008)
* edit range ([#1975](https://github.com/cheminfo/nmrium/issues/1975)) ([27141bc](https://github.com/cheminfo/nmrium/commit/27141bc4781dc291a4e50b673b118e6d4f0008b6))
* empty test cases not working ([#2180](https://github.com/cheminfo/nmrium/issues/2180)) ([45cb60d](https://github.com/cheminfo/nmrium/commit/45cb60d5840ec985afb9f9f07f9dac1e4f394762)), closes [#2172](https://github.com/cheminfo/nmrium/issues/2172)
* exclusion zones ([#1897](https://github.com/cheminfo/nmrium/issues/1897)) ([4766608](https://github.com/cheminfo/nmrium/commit/4766608a091459023fda5cf871f0abff51c4cfa6))
* export as raw data should not include the 'source' object ([#2241](https://github.com/cheminfo/nmrium/issues/2241)) ([c5eba03](https://github.com/cheminfo/nmrium/commit/c5eba031c3fdf11ea222343c6ea0c7c86a8c199d))
* extend preference dataSelection to jcamp format ([#2185](https://github.com/cheminfo/nmrium/issues/2185)) ([b88f7fd](https://github.com/cheminfo/nmrium/commit/b88f7fdad1e348964ba98ed41aecbae5fc28dbd7))
* handle correctly only bruker SER ([#2067](https://github.com/cheminfo/nmrium/issues/2067)) ([ad33c74](https://github.com/cheminfo/nmrium/commit/ad33c741b5c25340c0ffc6f36ece1930beb00d9d))
* hide/show spectra ([#1961](https://github.com/cheminfo/nmrium/issues/1961)) ([189dc94](https://github.com/cheminfo/nmrium/commit/189dc947a8c9962ecf276addf0f456bd1f054f9e)), closes [#1960](https://github.com/cheminfo/nmrium/issues/1960)
* import spectrum data with nmr-load-save ([#1862](https://github.com/cheminfo/nmrium/issues/1862)) ([520ce89](https://github.com/cheminfo/nmrium/commit/520ce89f5626fc77cab2f6385023010e676c30f3))
* importation ranges relative value from publication string ([#2228](https://github.com/cheminfo/nmrium/issues/2228)) ([893e3e5](https://github.com/cheminfo/nmrium/commit/893e3e56ff695d3c890261c146dade3609b64a59))
* jeol files with data not power of 2 ([af13a62](https://github.com/cheminfo/nmrium/commit/af13a621d4be0955c92e04734962df67cd785cb7))
* jpath ([91d9f7f](https://github.com/cheminfo/nmrium/commit/91d9f7f1989cfb45812c894be921c828f2af42c2)), closes [#2080](https://github.com/cheminfo/nmrium/issues/2080)
* multiple spectra analysis columns preferences ([#1878](https://github.com/cheminfo/nmrium/issues/1878)) ([7d45a4a](https://github.com/cheminfo/nmrium/commit/7d45a4a297ded9c788f8746223b767fd720fb4cd)), closes [#1874](https://github.com/cheminfo/nmrium/issues/1874)
* onload processing ([#2254](https://github.com/cheminfo/nmrium/issues/2254)) ([ede4887](https://github.com/cheminfo/nmrium/commit/ede488750bae842abce70931b1c34f9422bb93bf)), closes [#2250](https://github.com/cheminfo/nmrium/issues/2250)
* parse hex color and extract opacity ([#2233](https://github.com/cheminfo/nmrium/issues/2233)) ([991748a](https://github.com/cheminfo/nmrium/commit/991748a6ca416332770c196b8095d4dea4f5d6b3))
* prediction and improve speediness ([#1971](https://github.com/cheminfo/nmrium/issues/1971)) ([1f9aa4d](https://github.com/cheminfo/nmrium/commit/1f9aa4d7fd35f82f8eaf074b2e3ed482c96d9bde))
* rangesToACS don't guess multiplicity ([#2028](https://github.com/cheminfo/nmrium/issues/2028)) ([494fcc3](https://github.com/cheminfo/nmrium/commit/494fcc36f6b8f71ac9c642859a73507cdc031f90))
* re-edition of zero filling ([925cea7](https://github.com/cheminfo/nmrium/commit/925cea78eaf6fb271c2322813a4990c40c974bbd)), closes [#2150](https://github.com/cheminfo/nmrium/issues/2150)
* react table virtual scroll ([#1879](https://github.com/cheminfo/nmrium/issues/1879)) ([8b6def9](https://github.com/cheminfo/nmrium/commit/8b6def94f65f93767a566b7b1d954e8c0bf62ec3)), closes [#1863](https://github.com/cheminfo/nmrium/issues/1863)
* set `default` workspace if the specified workspace does not exists in the workspaces object ([#1989](https://github.com/cheminfo/nmrium/issues/1989)) ([733e3a8](https://github.com/cheminfo/nmrium/commit/733e3a842faeb7266280211ed1934d896ddf40d4)), closes [#1979](https://github.com/cheminfo/nmrium/issues/1979)
* set the zoom tool active when deselecting another tool ([ef718c7](https://github.com/cheminfo/nmrium/commit/ef718c7d05f2a6640b6a5fc0c57646502e21f14b)), closes [#2066](https://github.com/cheminfo/nmrium/issues/2066)
* sorting by solvent ([#2037](https://github.com/cheminfo/nmrium/issues/2037)) ([23f7660](https://github.com/cheminfo/nmrium/commit/23f76601d5f74a626e6c6903f2da6f990bf545a4)), closes [#2017](https://github.com/cheminfo/nmrium/issues/2017)
* spectra table columns width ([#2210](https://github.com/cheminfo/nmrium/issues/2210)) ([40a9f5b](https://github.com/cheminfo/nmrium/commit/40a9f5b37750db000ab5be684d3d790626cc30d9))
* speed of database load with precalculated indexes ([3c76502](https://github.com/cheminfo/nmrium/commit/3c765027eff0f3603dca9f96aac65c66da98b2f5))
* support .jcamp extensions ([d78acd4](https://github.com/cheminfo/nmrium/commit/d78acd43c8fa48727b8b176d1bcda938e17ac71b))
* swapped family and given name in citation.cff ([#2047](https://github.com/cheminfo/nmrium/issues/2047)) ([9fae0ad](https://github.com/cheminfo/nmrium/commit/9fae0adaab0620961abf6f50f4d0a3bc1ee8d5e1))
* the 2d tab should be active by default if we have 2d and 1d spectra ([741646d](https://github.com/cheminfo/nmrium/commit/741646d883990c099e63e096cd96900cb3a6b5c4))
* use svg transform instead of css transform ([#2204](https://github.com/cheminfo/nmrium/issues/2204)) ([1631aac](https://github.com/cheminfo/nmrium/commit/1631aacfd281bde38845694a2280beaf82759c0d))
* vertical axis for the slicing tool ([#1846](https://github.com/cheminfo/nmrium/issues/1846)) ([06e2787](https://github.com/cheminfo/nmrium/commit/06e2787b7bf76c15e01ea22c9dc173a5e6d1a0d6))
* wait for the container height value before calculating the virtual scroll boundary ([#2027](https://github.com/cheminfo/nmrium/issues/2027)) ([424328f](https://github.com/cheminfo/nmrium/commit/424328f5a33ad79320adee7dd43bdacc4f40fb2a))

## [0.33.0](https://github.com/cheminfo/nmrium/compare/v0.32.0...v0.33.0) (2022-10-27)


### Features

* show a message when the 2d has too many lines ([55617e2](https://github.com/cheminfo/nmrium/commit/55617e2f8ea17d6ee36d80a7d340584d45f6692e))
* support for inline jcamp from nmr-load-save ([#1816](https://github.com/cheminfo/nmrium/issues/1816)) ([c9fcbf4](https://github.com/cheminfo/nmrium/commit/c9fcbf4bdee6c224e5b2e573396fb7fba2072be9))


### Bug Fixes

* absolute integration column format ([#1828](https://github.com/cheminfo/nmrium/issues/1828)) ([f87886b](https://github.com/cheminfo/nmrium/commit/f87886bee312f6a09e0072f370cc4d470eecd352)), closes [#1827](https://github.com/cheminfo/nmrium/issues/1827)
* add `jcamp` to data source types ([bc1bd11](https://github.com/cheminfo/nmrium/commit/bc1bd11a69071aef5a31e4481701c49a1c7af91f))
* chemical shift in 'ranges' has no impact ([e55c35f](https://github.com/cheminfo/nmrium/commit/e55c35fa4739bec1db543ed7ce746bf2b4ba46fa)), closes [#1808](https://github.com/cheminfo/nmrium/issues/1808)
* remove DC offset if AQ_mod is qsim ([#1804](https://github.com/cheminfo/nmrium/issues/1804)) ([135a072](https://github.com/cheminfo/nmrium/commit/135a072693d0de425025abeb8d90429b1a7a3008))

## [0.32.0](https://github.com/cheminfo/nmrium/compare/v0.31.0...v0.32.0) (2022-10-13)


### Features

* add ellipsis to molecule label when exceeding the defined size ([62b268a](https://github.com/cheminfo/nmrium/commit/62b268a45db1e0b119642d8ca4d834f07236d207)), closes [#1784](https://github.com/cheminfo/nmrium/issues/1784)
* display the index of the x array of the spectrum in the 1D footer ([8f32820](https://github.com/cheminfo/nmrium/commit/8f328209d741cf823815eb00acd903bb7d01f868)), closes [#1795](https://github.com/cheminfo/nmrium/issues/1795)
* improve zoom tool ([#1794](https://github.com/cheminfo/nmrium/issues/1794)) ([9fe278f](https://github.com/cheminfo/nmrium/commit/9fe278f4ed0b0b92c0d480ef230532a73f342bcf)), closes [#1783](https://github.com/cheminfo/nmrium/issues/1783)
* limit the Molecule label length to a maximum of 10 characters ([9a49474](https://github.com/cheminfo/nmrium/commit/9a4947477fb190f270e1e15d73a7aea74f3c717d)), closes [#1691](https://github.com/cheminfo/nmrium/issues/1691)
* sync 2d chart spectrum colors ([#1807](https://github.com/cheminfo/nmrium/issues/1807)) ([10c7b1a](https://github.com/cheminfo/nmrium/commit/10c7b1af7d8d5399233237fedf5ade34eb66aad8))


### Bug Fixes

* **contours:** use xSanplot instead of absMedian ([#1790](https://github.com/cheminfo/nmrium/issues/1790)) ([e8b16c7](https://github.com/cheminfo/nmrium/commit/e8b16c7a08624cc32212dc71cee487dab326bfb9))
* copy to clipboard in Safari ([a6b54c9](https://github.com/cheminfo/nmrium/commit/a6b54c956a7b3c8b860ecd346174879d91df769c))
* count callback tests ([#1802](https://github.com/cheminfo/nmrium/issues/1802)) ([2d69b50](https://github.com/cheminfo/nmrium/commit/2d69b50c1c821775fb6025c508f07b1f48963c67))
* phase correction crash after absolute ([e185b71](https://github.com/cheminfo/nmrium/commit/e185b712c4b497e1b665323299afb3b129fdfaf1)), closes [#1766](https://github.com/cheminfo/nmrium/issues/1766)
* shift spectrum not working when change the value directly from peaks table ([acd1ab3](https://github.com/cheminfo/nmrium/commit/acd1ab3c88aeeb52f6ce1b8665769792b55e19d8))
* stop page scrolling when zooming in spectra by mouse wheel ([46e0b16](https://github.com/cheminfo/nmrium/commit/46e0b16cf3503260abbeae7f9f3bb53344ca63b6)), closes [#1799](https://github.com/cheminfo/nmrium/issues/1799)
* switch between Real and imaginary spectra ([bfbae61](https://github.com/cheminfo/nmrium/commit/bfbae61840e8f8e404eb7506218128ab4061bc5b)), closes [#1780](https://github.com/cheminfo/nmrium/issues/1780)

## [0.31.0](https://github.com/cheminfo/nmrium/compare/v0.30.0...v0.31.0) (2022-09-23)


### Features

* allow apodization, zf, ft in exercises ([4ee24ba](https://github.com/cheminfo/nmrium/commit/4ee24bad78882c8d55e3d1f3a44d6d7f8e905fe2))
* implement onViewChange callback ([#1743](https://github.com/cheminfo/nmrium/issues/1743)) ([865cfe6](https://github.com/cheminfo/nmrium/commit/865cfe65e5e97d15eec7565d3acbaa1823bd3d14))
* remember position of floating molecule ([#1730](https://github.com/cheminfo/nmrium/issues/1730)) ([179e4a0](https://github.com/cheminfo/nmrium/commit/179e4a0fe32b27d9ae8e53aab344fedb050f7392))
* use nmr-load-save to allow among other to drag / drop directly a bruker folder ([#1753](https://github.com/cheminfo/nmrium/issues/1753)) ([11a6fa3](https://github.com/cheminfo/nmrium/commit/11a6fa30b0f4a9cdd73739566b1b753eb3087518))


### Bug Fixes

* dialog box position ([#1757](https://github.com/cheminfo/nmrium/issues/1757)) ([ce1ab49](https://github.com/cheminfo/nmrium/commit/ce1ab49750f04279ce7cd6543f86a009c413042c))
* peak shape drawing ([#1767](https://github.com/cheminfo/nmrium/issues/1767)) ([90a75a7](https://github.com/cheminfo/nmrium/commit/90a75a77d25630170d806007664aa5ef184b5466)), closes [#1746](https://github.com/cheminfo/nmrium/issues/1746)
* peaks, signals, ranges, zones with id ([#1732](https://github.com/cheminfo/nmrium/issues/1732)) ([bdb4daa](https://github.com/cheminfo/nmrium/commit/bdb4daa917a149fe2186a9a668511ffdc291565a))
* refactor range tools state to fix state-related bugs ([#1731](https://github.com/cheminfo/nmrium/issues/1731)) ([ebac30a](https://github.com/cheminfo/nmrium/commit/ebac30a305b5f1dd0da4e3caa29a83d50235bf61))
* support changing onViewChange callback ([ff529ed](https://github.com/cheminfo/nmrium/commit/ff529ed8e4a0d3b9a60e1763ce59622c6290f76c))

## [0.30.0](https://github.com/cheminfo/nmrium/compare/v0.29.0...v0.30.0) (2022-08-26)


### ⚠ BREAKING CHANGES

* React v18 is now mandatory

### Features

* activate resizing for integrals/ranges when its tool selected ([4c75f34](https://github.com/cheminfo/nmrium/commit/4c75f345735e718fcf8687867ba9fb393b824399)), closes [#1648](https://github.com/cheminfo/nmrium/issues/1648)
* apodization window preview ([#1647](https://github.com/cheminfo/nmrium/issues/1647)) ([16b97b3](https://github.com/cheminfo/nmrium/commit/16b97b36a3df275ade018f10769a33fc6ea26aa0))
* change the spectra alignment from stack to center when pressing on 'c' shortcut ([7be801f](https://github.com/cheminfo/nmrium/commit/7be801f62a8ab4e3f726d08e2e7b80ea03b005ec)), closes [#1652](https://github.com/cheminfo/nmrium/issues/1652)
* disable baseline correction live preview ([b1e7845](https://github.com/cheminfo/nmrium/commit/b1e784591a7aa7f222c52a4f552bad7d2ec40000))
* enable/disable resize in the resizer component ([6797c43](https://github.com/cheminfo/nmrium/commit/6797c4362249700c8af28538e4bab471e638c619))
* improve 1d filters  ([#1623](https://github.com/cheminfo/nmrium/issues/1623)) ([4651216](https://github.com/cheminfo/nmrium/commit/465121603fe468f751401521257a892a9f94bd3b))
* improve multiple spectra range deletion ([e6007e3](https://github.com/cheminfo/nmrium/commit/e6007e3e998b0eb310162ddec7a2a0c572a7ced7)), closes [#1661](https://github.com/cheminfo/nmrium/issues/1661)
* improve peak picking ([ecc091c](https://github.com/cheminfo/nmrium/commit/ecc091c4a7957e4c5fd332e44f7d1b6f7a6c50d3)), closes [#1651](https://github.com/cheminfo/nmrium/issues/1651)
* improve remove exclusion zone/s ([d24dfb1](https://github.com/cheminfo/nmrium/commit/d24dfb10e0476bdb9e053ea02a6b9d3b91506c7a)), closes [#1667](https://github.com/cheminfo/nmrium/issues/1667)
* improvement of prediction panel ([fa9d49c](https://github.com/cheminfo/nmrium/commit/fa9d49cf607740be9f2df70dedde0b1436e42969)), closes [#1664](https://github.com/cheminfo/nmrium/issues/1664)
* move selected spectrum to front ([784a793](https://github.com/cheminfo/nmrium/commit/784a793e30f429392eeb502b70b16efe415ddbbd))
* open spectra panel after prediction ([a939255](https://github.com/cheminfo/nmrium/commit/a939255b45f93589c3a2d280fdbce04419ad03f1)), closes [#1663](https://github.com/cheminfo/nmrium/issues/1663)
* peaks annotations should not be displayed if the spectrum not active ([e10f0bd](https://github.com/cheminfo/nmrium/commit/e10f0bdf1972fc8a94c15d0602a0ac284706133e)), closes [#1662](https://github.com/cheminfo/nmrium/issues/1662)
* React v18 is now mandatory ([2793d90](https://github.com/cheminfo/nmrium/commit/2793d907181b33783e30f2fdbaf4f0d35ee3d4c0))
* zero-filling filter live preview ([5979a85](https://github.com/cheminfo/nmrium/commit/5979a855a622b4d6219db58fa349acffd1b0c246)), closes [#1646](https://github.com/cheminfo/nmrium/issues/1646)


### Bug Fixes

* absolute median as noise level for 2D ([#1660](https://github.com/cheminfo/nmrium/issues/1660)) ([735eb90](https://github.com/cheminfo/nmrium/commit/735eb9087cf001f0948b4a52910fec0e8a78e9a1))
* correct and refactor floating molecules ([#1715](https://github.com/cheminfo/nmrium/issues/1715)) ([9000808](https://github.com/cheminfo/nmrium/commit/9000808ea53b53f90d86a7fac4626dd49e938af9))
* database search ([c9af976](https://github.com/cheminfo/nmrium/commit/c9af97637f908dda1252fb77a025094f8f1e3bc0)), closes [#1678](https://github.com/cheminfo/nmrium/issues/1678)
* import molecules id on loading json data ([#1725](https://github.com/cheminfo/nmrium/issues/1725)) ([5c43d1f](https://github.com/cheminfo/nmrium/commit/5c43d1fdc5fbd5875d432ec2a7a157653ee68037))
* improve 2D first display performance ([78be996](https://github.com/cheminfo/nmrium/commit/78be9969cac8118332c376bba2308b16fa5f9bca))
* **prediction2D:** right place for experiment ([#1675](https://github.com/cheminfo/nmrium/issues/1675)) ([e331998](https://github.com/cheminfo/nmrium/commit/e331998554cadd22eeea2641fbe23dfd4f1fcde9))
* **prediction:** empty multiplicity for singulets ([b2d6b2d](https://github.com/cheminfo/nmrium/commit/b2d6b2d006ec932f74691bc6eb0b52c7cfbe45aa))
* resizing multiple spectra range ([e6007e3](https://github.com/cheminfo/nmrium/commit/e6007e3e998b0eb310162ddec7a2a0c572a7ced7))
* round data to dataPoints reported ([#1685](https://github.com/cheminfo/nmrium/issues/1685)) ([f271ade](https://github.com/cheminfo/nmrium/commit/f271adef416c34bac8cfdebde76617c9626d25b3))
* show change sum modal when structure panel is visible ([f58ad99](https://github.com/cheminfo/nmrium/commit/f58ad9992b8252fcf5061faac78375f473e2c1c1)), closes [#1687](https://github.com/cheminfo/nmrium/issues/1687)

## [0.29.0](https://github.com/cheminfo/nmrium/compare/v0.28.0...v0.29.0) (2022-07-25)


### Features

* activate/deactivate baseline correction live preview ([e835290](https://github.com/cheminfo/nmrium/commit/e835290f2281fac5ef9476c08cf2dfe922c28780))
* improve general settings ([#1611](https://github.com/cheminfo/nmrium/issues/1611)) ([92d1c93](https://github.com/cheminfo/nmrium/commit/92d1c938562ba4f5004b6bf41bf62e4216e48079))


### Bug Fixes

* resetting database ([23fa7b5](https://github.com/cheminfo/nmrium/commit/23fa7b5e7849ba892cc95dcbd432bee25686b33b)), closes [#1638](https://github.com/cheminfo/nmrium/issues/1638)

## [0.28.0](https://github.com/cheminfo/nmrium/compare/v0.27.0...v0.28.0) (2022-07-15)


### Features

* add hyperlink to database record in preferences if google docs ([abfaa6a](https://github.com/cheminfo/nmrium/commit/abfaa6a21dad2f6d28cb4d7d176f49f20faade54)), closes [#1499](https://github.com/cheminfo/nmrium/issues/1499)
* add ranges when adding jcamp from the database ([8a4bd63](https://github.com/cheminfo/nmrium/commit/8a4bd639a502b938a64608a01610cbaefa6f539a)), closes [#1571](https://github.com/cheminfo/nmrium/issues/1571)
* automatically close the right side of the split ([d94cc68](https://github.com/cheminfo/nmrium/commit/d94cc6895b25170c791ec3a3b6b87cbc68a96f8c)), closes [#1570](https://github.com/cheminfo/nmrium/issues/1570)
* automatically load the default database when open its panel ([#1612](https://github.com/cheminfo/nmrium/issues/1612)) ([d61c0aa](https://github.com/cheminfo/nmrium/commit/d61c0aa5c1bec89dd938257d1e25cbc8ad9fc932)), closes [#1608](https://github.com/cheminfo/nmrium/issues/1608)
* database advanced search by molecule structure ([#1602](https://github.com/cheminfo/nmrium/issues/1602)) ([fed6872](https://github.com/cheminfo/nmrium/commit/fed6872c382050b30a17ec0e6eac5443b5bc06e0))
* database can have `ocl` property that will be used index if available ([9afad9b](https://github.com/cheminfo/nmrium/commit/9afad9b033f8439ff394797e79048bb36b002ee6))
* disable drag and drop ([503f1c0](https://github.com/cheminfo/nmrium/commit/503f1c0cf026af2a5ca760fadaf77e1103c8bffb)), closes [#1582](https://github.com/cheminfo/nmrium/issues/1582)
* expanded hydrogens in the floating molecule ([7dd5e9c](https://github.com/cheminfo/nmrium/commit/7dd5e9cc27e309ee633761e03d4311b9048f8ac0)), closes [#1572](https://github.com/cheminfo/nmrium/issues/1572)
* force component preferences over local storage preferences ([0c9b63d](https://github.com/cheminfo/nmrium/commit/0c9b63df9b64091161a89e124670019ddae7d236))
* force SplitPanel re-render when hidePanelOnLoad value change ([9f01e7f](https://github.com/cheminfo/nmrium/commit/9f01e7f97b1e18a5274adf4d444c23a453e6e5ef))
* format the decimal fields in database panel ([4700745](https://github.com/cheminfo/nmrium/commit/470074583328838c22613b1773b3423a0d8a6675)), closes [#1592](https://github.com/cheminfo/nmrium/issues/1592)
* generate spectra viewer as blob from outside component ([#1589](https://github.com/cheminfo/nmrium/issues/1589)) ([d64597c](https://github.com/cheminfo/nmrium/commit/d64597cc648fd3753dca0bd821a1dcf9cb51cd24))
* improve loading database ([#1615](https://github.com/cheminfo/nmrium/issues/1615)) ([288e4b0](https://github.com/cheminfo/nmrium/commit/288e4b03720d4428759f5fbcbc3f79d9caf63a44)), closes [#1614](https://github.com/cheminfo/nmrium/issues/1614)
* live preview for baseline correction ([#1621](https://github.com/cheminfo/nmrium/issues/1621)) ([1993aa3](https://github.com/cheminfo/nmrium/commit/1993aa3ca13efdbab6be33f9bc285c3663b219b4))
* reapply the line broadening filter should take the last value and not the sum ([c083073](https://github.com/cheminfo/nmrium/commit/c0830737d48158e233552232ebbdbcbf99a9898e)), closes [#1618](https://github.com/cheminfo/nmrium/issues/1618)
* return .nmrium format when trigger onDataChange ([bf97af0](https://github.com/cheminfo/nmrium/commit/bf97af01799992191b3eabd369d7143fc149279b)), closes [#1584](https://github.com/cheminfo/nmrium/issues/1584)
* set default alignment 'stack' when loading many spectra ([72599ea](https://github.com/cheminfo/nmrium/commit/72599ea2a327860357cc1127b24950471b492fa9)), closes [#1577](https://github.com/cheminfo/nmrium/issues/1577)
* show a message if the import is disabled ([581d587](https://github.com/cheminfo/nmrium/commit/581d587895c2961f7dacc433d9ad21c231e14ccc)), closes [#1586](https://github.com/cheminfo/nmrium/issues/1586)
* throttling to display jcamp from database ([99c7c34](https://github.com/cheminfo/nmrium/commit/99c7c3457055301d38cd6fe78626dcf4a2d70441)), closes [#1575](https://github.com/cheminfo/nmrium/issues/1575)
* use idCode in database lookup ([#1609](https://github.com/cheminfo/nmrium/issues/1609)) ([f2f631e](https://github.com/cheminfo/nmrium/commit/f2f631e3d66d35232b833d79408dc9d02841f674))


### Bug Fixes

* database numberic column format ([5353842](https://github.com/cheminfo/nmrium/commit/5353842fbb36c20c3f13792b6686fe19212c8d01))
* database numeric column format ([057976e](https://github.com/cheminfo/nmrium/commit/057976e20d01c8f38d638bc09d76bc9163710c20))
* edition of range after automatic assignment crash ([a4357bf](https://github.com/cheminfo/nmrium/commit/a4357bf5225ad5e0fd16bb784b3619eae5cca5c6)), closes [#1597](https://github.com/cheminfo/nmrium/issues/1597)
* Ignoring of wobble curve does not work  ([#1590](https://github.com/cheminfo/nmrium/issues/1590)) ([ec2607d](https://github.com/cheminfo/nmrium/commit/ec2607ded131243d73cbd59a900952cd15a3f0f5)), closes [#1581](https://github.com/cheminfo/nmrium/issues/1581)
* molecule panel resizing ([d06c992](https://github.com/cheminfo/nmrium/commit/d06c992121142f6ea6e9af579930c6531b98e964)), closes [#1574](https://github.com/cheminfo/nmrium/issues/1574)
* pressing 's' when having one spectrum affects the other vertical alignment options ([6b2792c](https://github.com/cheminfo/nmrium/commit/6b2792c48474fe447ca22dc7191824276300d9b6))
* side panel not initially closed when hidePanelOnLoad is true ([9ddcbe7](https://github.com/cheminfo/nmrium/commit/9ddcbe7159c90748c78ba855a7b76f2978f7e7e4))
* update local storage when NMRium preference changed ([43dd395](https://github.com/cheminfo/nmrium/commit/43dd3955c6e46defb34cf5edaa377b79d231240e))
* wheel zoom ([5017036](https://github.com/cheminfo/nmrium/commit/50170363a6a08560970aaf262c1cda2f674b8a83))
* when tool button is not available shortcut should not be available neither ([4c08578](https://github.com/cheminfo/nmrium/commit/4c08578e6345ef1998f30a0a99a6c190a6523a46)), closes [#1504](https://github.com/cheminfo/nmrium/issues/1504)
* wrong "search by structure" button status ([8c84764](https://github.com/cheminfo/nmrium/commit/8c847647aa51de1733a9d3b957bff37f4cc2abfa)), closes [#1603](https://github.com/cheminfo/nmrium/issues/1603)

## [0.27.0](https://github.com/cheminfo/nmrium/compare/v0.26.0...v0.27.0) (2022-06-03)


### Features

* add automatic assignment panel to general preferences ([31e14d1](https://github.com/cheminfo/nmrium/commit/31e14d146b167f24d25528f6782b51a1c063d838)), closes [#1461](https://github.com/cheminfo/nmrium/issues/1461)
* allow edition of equivalence for hetero atoms ([#1550](https://github.com/cheminfo/nmrium/issues/1550)) ([b0453fb](https://github.com/cheminfo/nmrium/commit/b0453fb881f0f9457a1971f503332a65aec0d9e3))
* customize the initial width of the side panel ([9a2be39](https://github.com/cheminfo/nmrium/commit/9a2be39ef132c828d68c3c9a469a3ab5eb3682e5)), closes [#1558](https://github.com/cheminfo/nmrium/issues/1558)
* databases management ([#1505](https://github.com/cheminfo/nmrium/issues/1505)) ([e283960](https://github.com/cheminfo/nmrium/commit/e283960c6bf176c48436234b05daf78a4001d588))
* default displayed name when import jcamp ([b451ab9](https://github.com/cheminfo/nmrium/commit/b451ab973bd1e8c5d2d8947108ed14afcd903afe)), closes [#1493](https://github.com/cheminfo/nmrium/issues/1493)
* edit molecule by double-click on the floating molecule structure ([c071f5a](https://github.com/cheminfo/nmrium/commit/c071f5ad9143be406a8cb19e743e2fb03444a40e)), closes [#1529](https://github.com/cheminfo/nmrium/issues/1529)
* embedded workspace ([cc3ad59](https://github.com/cheminfo/nmrium/commit/cc3ad59f6431899a32537e393aad5b6c03b6fd4d))
* float molecule structures over the spectrum ([#1525](https://github.com/cheminfo/nmrium/issues/1525)) ([843173d](https://github.com/cheminfo/nmrium/commit/843173d9456f3007a0ceb71583844572b822c5b7))
* improve panels and general preferences ([#1547](https://github.com/cheminfo/nmrium/issues/1547)) ([88eee3c](https://github.com/cheminfo/nmrium/commit/88eee3c2758b66c0556e52f8933e8f9fa6d5b849))
* keep Molecule structure floating over the spectrum when editing it ([64fd971](https://github.com/cheminfo/nmrium/commit/64fd971d746f8690534bba8606595dde045eaa60)), closes [#1528](https://github.com/cheminfo/nmrium/issues/1528)
* label the molecule ([907d09a](https://github.com/cheminfo/nmrium/commit/907d09a974143434efdd1117027549432a0169fa)), closes [#1342](https://github.com/cheminfo/nmrium/issues/1342)
* preview spectrum from database  ([#1561](https://github.com/cheminfo/nmrium/issues/1561)) ([24174cc](https://github.com/cheminfo/nmrium/commit/24174cc729d9fa0dcbd59b82a35c57f77a81ad01))
* show/hide kind column in ranges panels ([6c3899b](https://github.com/cheminfo/nmrium/commit/6c3899bd2fe76919b302d01ea6930433769237d5)), closes [#1562](https://github.com/cheminfo/nmrium/issues/1562)
* specify whether the split pane is initially closed or not ([ecc7b86](https://github.com/cheminfo/nmrium/commit/ecc7b86f77a67aad9a53d2d598874d6bf90e5af1)), closes [#1494](https://github.com/cheminfo/nmrium/issues/1494)


### Bug Fixes

* 1d data not converted to typed array ([7472a77](https://github.com/cheminfo/nmrium/commit/7472a7702321d0cae6db1d4342399048b4e59087)), closes [#1555](https://github.com/cheminfo/nmrium/issues/1555)
* coupling tree not working ([4c660c1](https://github.com/cheminfo/nmrium/commit/4c660c19e46272f7065675197f5f2408c431313a)), closes [#1544](https://github.com/cheminfo/nmrium/issues/1544)
* manual 1D ranges detection crash after processing spectrum FID to FTT ([dd470ce](https://github.com/cheminfo/nmrium/commit/dd470ce0a0015f60689b110c5225689c83acbeb6)), closes [#1465](https://github.com/cheminfo/nmrium/issues/1465)
* Peak width is given in Hz and correctly formatted ([43d6c3b](https://github.com/cheminfo/nmrium/commit/43d6c3b82c7bb015e420906ddc65004bf237f34d))
* ranges notations do not exist when exported as SVG or jpeg ([109f900](https://github.com/cheminfo/nmrium/commit/109f900996efc95efef0c690887a7c1f24d27654)), closes [#1567](https://github.com/cheminfo/nmrium/issues/1567)
* resurrect spectrum from ranges crash ([#1565](https://github.com/cheminfo/nmrium/issues/1565)) ([2ebdeb1](https://github.com/cheminfo/nmrium/commit/2ebdeb1316841ee5254273f995b8008c1efe9f22))
* spectra stack alignment does not work when load .nmrium ([33ce29b](https://github.com/cheminfo/nmrium/commit/33ce29b40b25cb04e986066565ecddd3086fe0f0)), closes [#1495](https://github.com/cheminfo/nmrium/issues/1495)
* wrong SVG generated in 2D ([b1f8ae1](https://github.com/cheminfo/nmrium/commit/b1f8ae14be802d2fd041b5af46cbe9a65724ae1b)), closes [#1551](https://github.com/cheminfo/nmrium/issues/1551)

## [0.26.0](https://www.github.com/cheminfo/nmrium/compare/v0.25.0...v0.26.0) (2022-04-21)


### Features

* add .zenodo.json ([a904dae](https://www.github.com/cheminfo/nmrium/commit/a904daefd5d076d2b2dec6111712f671ec608b95))
* auto assignments ([#1456](https://www.github.com/cheminfo/nmrium/issues/1456)) ([1024c2e](https://www.github.com/cheminfo/nmrium/commit/1024c2e81febaeef916fbedfd0a9fe6ef3aa1921))
* auto-assignment by clicking on the row of the table ([132afb1](https://www.github.com/cheminfo/nmrium/commit/132afb17be12175503ad1c999b0bb5c8ecb3cc16))
* automatically assign the first result of the assignments ([d3d8ad1](https://www.github.com/cheminfo/nmrium/commit/d3d8ad164f8bcd7bac959511724692b4ce3ec4bc)), closes [#1477](https://www.github.com/cheminfo/nmrium/issues/1477)
* highlight clicked row in auto-assignments table ([b988f7d](https://www.github.com/cheminfo/nmrium/commit/b988f7de8c97f91c8bed36c16563e187b968de12)), closes [#1486](https://www.github.com/cheminfo/nmrium/issues/1486)
* read jcamp raw data ([def0ee8](https://www.github.com/cheminfo/nmrium/commit/def0ee817549dfe64ae415143cac273f0be780c0)), closes [#1481](https://www.github.com/cheminfo/nmrium/issues/1481)
* replicate spectra Peak picking function in automatic assignment panel ([d8e6180](https://www.github.com/cheminfo/nmrium/commit/d8e6180d5c12126bb62a3b2274b52343cac86ead)), closes [#1480](https://www.github.com/cheminfo/nmrium/issues/1480)
* reset automatic assignments ([1441c5c](https://www.github.com/cheminfo/nmrium/commit/1441c5c248c68987ddb0880629e934e2276874ba)), closes [#1488](https://www.github.com/cheminfo/nmrium/issues/1488)


### Bug Fixes

* assignment tool not assign all diaIDs ([3ae5cd3](https://www.github.com/cheminfo/nmrium/commit/3ae5cd3235646775324addebde9022b126b8c85a)), closes [#1478](https://www.github.com/cheminfo/nmrium/issues/1478)
* data change does not re-initiate the state ([1b96235](https://www.github.com/cheminfo/nmrium/commit/1b9623589997ce007ace2e0c46a2a2109b670609))
* difference of assignment with and without 'explode' protons ([fd365f3](https://www.github.com/cheminfo/nmrium/commit/fd365f3e9fae8a9a9fa548b1591d5abcd06c30bd)), closes [#1479](https://www.github.com/cheminfo/nmrium/issues/1479)
* highlight in some assignment ([a736e7d](https://www.github.com/cheminfo/nmrium/commit/a736e7da2f25041e290ee0227c8184bf66b03a72)), closes [#1490](https://www.github.com/cheminfo/nmrium/issues/1490)
* leaving a zone is not always detected ([cd6d86e](https://www.github.com/cheminfo/nmrium/commit/cd6d86e5976ff281f7db2f5aa1e6407a7df38b36)), closes [#1474](https://www.github.com/cheminfo/nmrium/issues/1474)
* Nuclei formatting in general settings ([42a20a1](https://www.github.com/cheminfo/nmrium/commit/42a20a1e1b6f2f576a25e2e28a1c4e1fd6f789b0)), closes [#1471](https://www.github.com/cheminfo/nmrium/issues/1471) [#1473](https://www.github.com/cheminfo/nmrium/issues/1473)
* use CITATION.cff ([bfd9c69](https://www.github.com/cheminfo/nmrium/commit/bfd9c69ae4abee8d1132ea54037f6caeab0d07e2))

## [0.25.0](https://www.github.com/cheminfo/nmrium/compare/v0.24.1...v0.25.0) (2022-04-07)


### Features

* Button component ([44fd565](https://www.github.com/cheminfo/nmrium/commit/44fd565bea14a7650eb7af41d9d86211f537b850))


### Bug Fixes

* pressing "Enter" in NMRium triggers the file selector dialog ([012e28b](https://www.github.com/cheminfo/nmrium/commit/012e28bb0a24cb8f750167de3207487a1aa77875)), closes [#1460](https://www.github.com/cheminfo/nmrium/issues/1460)
* update dependencies ([#1428](https://www.github.com/cheminfo/nmrium/issues/1428)) ([21ffc50](https://www.github.com/cheminfo/nmrium/commit/21ffc501a5fb359fde7a0918c5cb4951425898fc))

### [0.24.1](https://www.github.com/cheminfo/nmrium/compare/v0.24.0...v0.24.1) (2022-03-31)


### Bug Fixes

* full ethyl benzene sample crash ([b8626de](https://www.github.com/cheminfo/nmrium/commit/b8626de6f96c35874acb2e769620bf94bfb13a39))
* reload NMRium with the last selected workspace ([cb52cdc](https://www.github.com/cheminfo/nmrium/commit/cb52cdc8f1c1c1d7c217eb80f4259dda58c3577c)), closes [#1453](https://www.github.com/cheminfo/nmrium/issues/1453)

## [0.24.0](https://www.github.com/cheminfo/nmrium/compare/v0.23.0...v0.24.0) (2022-03-29)


### Features

* add name for predicted spectra ([e032417](https://www.github.com/cheminfo/nmrium/commit/e0324177cdea7bd27751d95dcbc669a0468f5c68)), closes [#1452](https://www.github.com/cheminfo/nmrium/issues/1452)
* distinguish predicted spectra color per sample ([f2b5acb](https://www.github.com/cheminfo/nmrium/commit/f2b5acba7d8cc2608db5821e4d830154b0368680))
* NMRium workspaces ([#1431](https://www.github.com/cheminfo/nmrium/issues/1431)) ([cd0ccbd](https://www.github.com/cheminfo/nmrium/commit/cd0ccbd3eae286de7f55dd84367b6e39130d9156))
* quick workspace change ([a1808a7](https://www.github.com/cheminfo/nmrium/commit/a1808a7da86c70616c4cb7c5ce4ba54ae94a8bd7)), closes [#1446](https://www.github.com/cheminfo/nmrium/issues/1446)


### Bug Fixes

* bug when drag / drop second NMRium file ([fe64cb1](https://www.github.com/cheminfo/nmrium/commit/fe64cb166b020b80d9665d4547cda30c3b8b69f7)), closes [#1421](https://www.github.com/cheminfo/nmrium/issues/1421)
* change integral sum option by selecting a molecule is hidden ([64c4887](https://www.github.com/cheminfo/nmrium/commit/64c4887cff1759b3b0502cacbb59185786373147))
* crash when unselect 2d spectrum ([790b27c](https://www.github.com/cheminfo/nmrium/commit/790b27c370918ce74e217c032e40a3431807a9b4)), closes [#1434](https://www.github.com/cheminfo/nmrium/issues/1434)
* generateSpectrum2D n getFrequency function ([#1450](https://www.github.com/cheminfo/nmrium/issues/1450)) ([ce8eb1b](https://www.github.com/cheminfo/nmrium/commit/ce8eb1b88c27cd37902d73d7202076af1dd59117))
* Reset workspace crash ([c2481d1](https://www.github.com/cheminfo/nmrium/commit/c2481d14a89ebb471c48f13697fede2781b81633)), closes [#1448](https://www.github.com/cheminfo/nmrium/issues/1448)
* sorting columns in ranges table ([67e850a](https://www.github.com/cheminfo/nmrium/commit/67e850a89bc4f6dc5e458a6e814857282d61433a))
* y scale was not refreshed after applying FFT Filter ([011ef72](https://www.github.com/cheminfo/nmrium/commit/011ef724265a90ed4c774d338749e1cb8fe4692c)), closes [#1430](https://www.github.com/cheminfo/nmrium/issues/1430)

## [0.23.0](https://www.github.com/cheminfo/nmrium/compare/v0.22.0...v0.23.0) (2022-03-11)


### Features

* create prediction panel ([3c96406](https://www.github.com/cheminfo/nmrium/commit/3c96406d50cc3a216c1cb4489bba064a13e6944c))


### Bug Fixes

* Bug when drag / drop second NMRium file ([08ada51](https://www.github.com/cheminfo/nmrium/commit/08ada516b698f7b540fa7c57683e79a54704feee)), closes [#1421](https://www.github.com/cheminfo/nmrium/issues/1421)
* change enum to be a simple string ([#1422](https://www.github.com/cheminfo/nmrium/issues/1422)) ([38066dc](https://www.github.com/cheminfo/nmrium/commit/38066dc9eeeb4cd98408aa2f005578ec14de210d))

## [0.22.0](https://www.github.com/cheminfo/nmrium/compare/v0.21.0...v0.22.0) (2022-03-10)


### Features

* add possibility to reset preferences ([6334620](https://www.github.com/cheminfo/nmrium/commit/63346207be1177f96dc58c52436e72c9f1758b94))
* create automatic assignment panel UI ([2307c82](https://www.github.com/cheminfo/nmrium/commit/2307c82b703526674578559b3322dbdbd56ee54d))


### Bug Fixes

* exclusion zone still visible when disabled its filter ([6b4d4cd](https://www.github.com/cheminfo/nmrium/commit/6b4d4cd9e3f9a53c2665357eefaf12666c198002)), closes [#1414](https://www.github.com/cheminfo/nmrium/issues/1414)
* integral or Multiple Spectra Analysis panels do not open when selecting its tool ([a170519](https://www.github.com/cheminfo/nmrium/commit/a1705198f3c9db36c1821b0f5c37087f9ad0ddf0)), closes [#1407](https://www.github.com/cheminfo/nmrium/issues/1407)
* nmrium crash when some keys not exists ([450decd](https://www.github.com/cheminfo/nmrium/commit/450decd8a274880a7332f519346bb85140179224)), closes [#1404](https://www.github.com/cheminfo/nmrium/issues/1404)
* onDataChange triggered when mouse enter/leave the displayer ([0b271e9](https://www.github.com/cheminfo/nmrium/commit/0b271e9c977c09da1f1575e7425c49a9c0af519b))
* vertical scroll on Firefox ([df4ad3b](https://www.github.com/cheminfo/nmrium/commit/df4ad3b58ef3a469dcbaedb902fe6258244c8ed2)), closes [#1418](https://www.github.com/cheminfo/nmrium/issues/1418)
* vertical zoom for spectra and integrals  ([#1416](https://www.github.com/cheminfo/nmrium/issues/1416)) ([c2df1ec](https://www.github.com/cheminfo/nmrium/commit/c2df1ecdf503d063a31a969e3111078db65d687f))

## [0.21.0](https://www.github.com/cheminfo/nmrium/compare/v0.20.2...v0.21.0) (2022-03-03)


### Features

* clear zoom history when pressing the "f" key ([fc1e457](https://www.github.com/cheminfo/nmrium/commit/fc1e457e8ea11354e4d097ef03e027abc56389d9)), closes [#1399](https://www.github.com/cheminfo/nmrium/issues/1399)
* hide multiple spectra auto range picking when ranges picking tool not active ([1690c82](https://www.github.com/cheminfo/nmrium/commit/1690c82a18a171f1035f03aeb1ae4ab28359a36a)), closes [#1396](https://www.github.com/cheminfo/nmrium/issues/1396)
* hide zones picking and slicing tool in exercise workspace ([c1f2c5d](https://www.github.com/cheminfo/nmrium/commit/c1f2c5d1215b173e8bc03599cae4c78d507d1fe3))
* save NMRium preferences by workspace ([#1393](https://www.github.com/cheminfo/nmrium/issues/1393)) ([83ddbc5](https://www.github.com/cheminfo/nmrium/commit/83ddbc5c26af990fd1ce662b0216b030eff1606b))
* show only spectra and integral panels in exercise workspace ([43b6c65](https://www.github.com/cheminfo/nmrium/commit/43b6c65883600b5c3b8db4a71ad87ae63a1a7029)), closes [#1395](https://www.github.com/cheminfo/nmrium/issues/1395)


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
