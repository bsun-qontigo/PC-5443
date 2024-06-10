export const BatchTranslation = {
	marketValue: 'BATCH_RESULTS.MARKET_VALUE',
	trackingError: 'BATCH_RESULTS.TRACKING_ERROR',
	trackingErrorDelta: 'BATCH_RESULTS.TRACKING_ERROR_DELTA',
	realizedGainsYTD: 'BATCH_RESULTS.YTD_REALIZED_NET_GAIN',
	realizedGainsYTDPercent: 'BATCH_RESULTS.YTD_REALIZED_NET_GAIN_PERCENT',
	realizedNetGainsDelta: 'BATCH_RESULTS.REALIZED_NET_GAINS_DELTA',
	realizedNetGainsDeltaPercent: 'BATCH_RESULTS.REALIZED_NET_GAINS_DELTA_PERCENT',
	unRealizedLossAvailable: 'BATCH_RESULTS.UNREALIZED_LOSS_AVAILABLE',
	unRealizedLossAvailablePercent: 'BATCH_RESULTS.UNREALIZED_LOSS_AVAILABLE_PERCENT',
	deltaNetTaxLossOverTrackingErrorDelta: 'BATCH_RESULTS.DELTA_NET_TAX_LOSS_OVER_TRACKING_ERROR_DELTA',
	netTaxLossOverTurnoverDelta: 'BATCH_RESULTS.NET_TAX_LOSS_OVER_TURNOVER_DELTA',
	healthScore: 'BATCH_RESULTS.HEALTH_SCORE',
	numeraireCashIni: 'BATCH_RESULTS.INITIAL_NUMERAIRE_CASH',
	numeraireCash: 'BATCH_RESULTS.NUMERAIRE_CASH',
	numeraireCashDelta: 'BATCH_RESULTS.NUMERAIRE_CASH_DELTA',
	turnoverPercent: 'BATCH_RESULTS.TURNOVER_PERCENT',
	runDate: 'BATCH_RESULTS.RUN_DATE',
	newAccount: 'BATCH_RESULTS.NEW_ACCOUNT',
	newAccounts: 'NEW_ACCOUNTS',
	cashFlow: 'BATCH_RESULTS.CASH_FLOW',
	cashRaise: 'CASH_RAISE',
	cashDeficit: 'CASH_DEFICIT',
	marketValueIni: 'BATCH_RESULTS.MARKET_VALUE_INI',
	namesIni: 'BATCH_RESULTS.NAMES_INI',
	numeraireCashPctIni: 'BATCH_RESULTS.NUMERAIRE_CASH_PCT_INI',
	betaIni: 'BATCH_RESULTS.BETA_INI',
	beta: 'BATCH_RESULTS.BETA',
	betaDelta: 'BATCH_RESULTS.BETA_DELTA',
	activeBeta: 'BATCH_RESULTS.ACTIVE_BETA',
	activeBetaIni: 'BATCH_RESULTS.ACTIVE_BETA_INI',
	activeBetaDelta: 'BATCH_RESULTS.ACTIVE_BETA_DELTA',
	unRealizedLossAvailablePctIni: 'BATCH_RESULTS.UN_REALIZED_LOSS_AVAILABLE_PCT_INI',
	unRealizedSTLossAvailableIni: 'BATCH_RESULTS.UN_REALIZED_ST_LOSS_AVAILABLE_INI',
	unRealizedSTLossAvailable: 'BATCH_RESULTS.UN_REALIZED_ST_LOSS_AVAILABLE',
	unRealizedLTLossAvailableIni: 'BATCH_RESULTS.UN_REALIZED_LT_LOSS_AVAILABLE_INI',
	unRealizedLTLossAvailable: 'BATCH_RESULTS.UN_REALIZED_LT_LOSS_AVAILABLE',
	taxLiabilityIni: 'BATCH_RESULTS.TAX_LIABILITY_INI',
	realizedNetSTGLIni: 'BATCH_RESULTS.REALIZED_NET_STGL_INI',
	taxLiability: 'BATCH_RESULTS.TAX_LIABILITY',
	wealthLens: 'BATCH_RESULTS.WEALTH_LENS',
	maxSubscoreName: 'BATCH_RESULTS.WEALTH_LENS_DRIVER',
	compliance: 'BATCH_RESULTS.COMPLIANCE',
	unRealizedSTGainsIni: 'BATCH_RESULTS.UNREALIZED_ST_GAINS_INI', 
	unRealizedSTGains: 'BATCH_RESULTS.UNREALIZED_ST_GAINS', 
	realizedSTGainsYTDIni: 'BATCH_RESULTS.REALIZED_ST_GAINS_YTD_INI', 
	realizedSTGainsYTD: 'BATCH_RESULTS.REALIZED_ST_GAINS_YTD', 
	realizedSTGainsYTDDelta: 'BATCH_RESULTS.REALIZED_ST_GAINS_YTD_DELTA', 
	realizedSTLossesYTDIni: 'BATCH_RESULTS.REALIZED_ST_LOSSES_YTD_INI', 
	realizedSTLossesYTD: 'BATCH_RESULTS.REALIZED_ST_LOSSES_YTD', 
	realizedSTLossesYTDDelta: 'BATCH_RESULTS.REALIZED_ST_LOSSES_YTD_DELTA', 
	unRealizedLTGainsIni: 'BATCH_RESULTS.UNREALIZED_LT_GAINS_INI', 
	unRealizedLTGains: 'BATCH_RESULTS.UNREALIZED_LT_GAINS', 
	realizedLTGainsYTDIni: 'BATCH_RESULTS.REALIZED_LT_GAINS_YTD_INI', 
	realizedLTGainsYTD: 'BATCH_RESULTS.REALIZED_LT_GAINS_YTD', 
	realizedLTGainsYTDDelta: 'BATCH_RESULTS.REALIZED_LT_GAINS_YTD_DELTA', 
	realizedLTLossesYTDIni: 'BATCH_RESULTS.REALIZED_LT_LOSSES_YTD_INI', 
	realizedLTLossesYTD: 'BATCH_RESULTS.REALIZED_LT_LOSSES_YTD', 
	realizedLTLossesYTDDelta: 'BATCH_RESULTS.REALIZED_LT_LOSSES_YTD_DELTA', 
} as const;

export type BatchTranslation = keyof typeof BatchTranslation;