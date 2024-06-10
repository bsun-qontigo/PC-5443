const TEXT_EXTRA = 10;
const _hd = window.matchMedia('(max-width: 1080px)');
const _2k = window.matchMedia('(max-width: 1440px)');

export function getTextExtra(): number {
	if (_hd.matches) {
		return TEXT_EXTRA;
	}
	if (_2k.matches) {
		return TEXT_EXTRA * 1.2;
	}

	return TEXT_EXTRA * 1.4;
}