export enum Pages {
	LANDING,
	FILES,
	METHODS,
	RESULTS,
	ABOUT,
}

export enum ArgKind {
	FILE,
	SHA,
	METHOD,
	REPO,
}

export enum Key {
	UP = 'ArrowUp',
	DOWN = 'ArrowDown',
	LEFT = 'ArrowLeft',
	RIGHT = 'ArrowRight',
	BACKSPACE = 'Backspace',
	_0 = 'Digit0',
	_1 = 'Digit1',
	_2 = 'Digit2',
	_3 = 'Digit3',
	_4 = 'Digit4',
	_5 = 'Digit5',
	_6 = 'Digit6',
	_7 = 'Digit7',
	_8 = 'Digit8',
	_9 = 'Digit9',
}

export enum Changes {
	 BODY_CHANGE = "Ybodychange",
	 FILE_RENAME = "Yfilerename",
	 INTRODUCED = "Yintroduced",
	 EXCEPS_CHANGE = "Yexceptionschange",
	 MOD_CHANGE = "Ymodifierchange",
	 MOV_FROM_FILE = "Ymovefromfile",
	 MULTI_CHANGE = "Ymultichange",
	 NO_CHANGE = "Ynochange",
	 PARAM_CHANGE = "Yparameterchange",
	 PARAM_META_CHANGE = "Yparametermetachange",
	 RENAME = "Yrename",
	 RETURN_CHANGE = "Yreturntypechange",
}
