import {FadeableElement, IFadeableElementProps, IFadeableElementState} from "../../FadeableElement";
import {Constants} from "../../Constants";

export abstract class ReactCommitRow<P extends ICommitRowProps, S extends IFadeableElementState> extends FadeableElement<P, S> {
	protected datec: string = "";
	protected authc: string = "";
	protected filec: string = "";
	protected comtc: string = "";
	protected detlc: string = "";
	protected typec: string = "";

	protected setUpColours(): void {
		let variance: number;
		if (this.props.windowWidth < Constants.MOBILE_WIDTH) {
			variance = Constants.COMMIT_CELL_MOBILE_COLOUR_VARIANCE_PCT;
		} else {
			variance = Constants.COMMIT_CELL_COLOUR_VARIANCE_PCT;
		}
		function getColour(): string {
			let temp = Math.floor(Math.random() * variance);
			return temp < 10 ? "0" + temp : "" + temp;
		}

		this.datec = getColour();
		this.authc = getColour();
		this.filec = getColour();
		this.comtc = getColour();
		this.detlc = getColour();
		this.typec = getColour();
	}

	protected getFontSize(s: string, modifier: number = 1, logModifier: number = 1): string {
		const fontSize: number = this.props.windowWidth < Constants.MOBILE_WIDTH ? Constants.COMMIT_FONT_MOBILE_APPROX_SIZE : Constants.COMMIT_FONT_APPROX_SIZE;
		return Math.min(
			(this.props.windowWidth * (1 / Math.max(s.length, 8)) * 0.01 * fontSize * modifier),
			(Math.log(this.props.windowHeight) * Constants.COMMIT_ROW_HEIGHT / 2) * logModifier
		) + "px";
	}
}

export interface ICommitRowProps extends IFadeableElementProps{
	windowWidth: number;
	windowHeight: number;
}