# Changelog

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
