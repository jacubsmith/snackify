import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplte from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';

autocomplte($('#address'), $('#lat'), $('#lng'));
typeAhead($('.search'));
makeMap($('#map'));
const heartForms = $$('form.heart');
heartForms.on('submit', ajaxHeart);
