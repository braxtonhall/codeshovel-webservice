import {FadeableElement, IFadeableElementProps, IFadeableElementState} from "../FadeableElement";
import {Pages} from "../Enums";
import Cookies from "js-cookie";

export abstract class Page<P extends IPageProps, S extends IPageState> extends FadeableElement<P, S> {
	protected readonly fadeOutTime: number = 900;
	protected abstract readonly page: Pages;
	protected readonly cookieName: string = "";

	protected constructor(props: P) {
		super(props);
		this.handleNext = this.handleNext.bind(this);
		this.dismissTutorial = this.dismissTutorial.bind(this);
	}

	protected abstract handleNext(): void;

	protected chooseTransform(): string {
		if (this.props.page === this.page) {
			return "translate(-50%, -50%)";
		} else if (this.props.page > this.page) {
			return "translate(-200%, -50%)";
		} else {
			return "translate(200%, -50%)";
		}
	}

	protected dismissTutorial(): void {
		Cookies.set(this.cookieName, 'true');
		this.setState({tutorialDismissed: true});
	}
}

export interface IPageProps extends IFadeableElementProps {
	proceedToPage: (page: Pages) => void;
	page: Pages;
	windowWidth: number;
}

export interface IPageState extends IFadeableElementState {
	tutorialDismissed: boolean;
}
