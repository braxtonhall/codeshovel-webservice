import React, {ReactNode} from "react";
import {OutsideAlerter} from "../Util";
import {FadeableElement, IFadeableElementProps, IFadeableElementState} from "../FadeableElement";

export default class ErrorPane extends FadeableElement<IErrorPaneProps, IErrorPaneState> {
	protected readonly fadeOutTime: number = 500;

	public constructor(props: IErrorPaneProps) {
		super(props);
		this.state = {onScreen: this.props.active};
		this.exit = this.exit.bind(this);
	}

	public componentDidMount(): void {
		document.addEventListener('keydown', () => setImmediate(this.exit));
	}

	private exit(): void {
		if (this.props.active) {
			this.props.exit();
		}
	}

	public createReactNode(): ReactNode {
			return (this.state.onScreen || this.props.active ?
				<OutsideAlerter
					child={
						<div
							style={{
								textAlign: "center",
								verticalAlign: "center",
								position: "absolute",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
								height: this.props.size.height + "%",
								width: this.props.size.width + "%",
								backgroundColor: "rgb(255, 124, 124)",
								opacity: this.props.active ? 1 : 0,
								transition: this.fadeOutTime + "ms ease-in-out",
								zIndex: 9999,
							}}
						>
							<div
								style={{
									position: "absolute",
									top: "50%",
									left: "50%",
									transform: "translate(-50%, -50%)",
									font: "100% \"Courier New\", Futura, sans-serif"
								}}
							>
								{this.props.text}
							</div>
						</div>
					}
					handleClick={this.exit}
				/> : <div
						style={{
							opacity: 0,
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
						}}
					/>
			);
	}
}

export interface IErrorPaneProps extends IFadeableElementProps {
	text: string;
	exit: () => void;
	size: {height: number, width: number};
}

export interface IErrorPaneState extends IFadeableElementState {

}