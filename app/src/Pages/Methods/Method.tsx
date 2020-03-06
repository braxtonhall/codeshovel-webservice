import {IFadeableElementProps} from "../../FadeableElement";
import {IMethodTransport} from "../../Types";
import {Constants} from "../../Constants";
import {ReactNode} from "react";
import * as React from "react";

export class Method extends React.Component<IReactMethodProps, IReactMethodState> {
	protected readonly fadeOutTime: number = Constants.METHODS_METHOD_ANIMATE_TIME;
	private turnedOn: boolean;
	private readonly backgroundColor: string;

	constructor(props: IReactMethodProps) {
		super(props);
		this.state = {
			margin: 0,
		};
		this.backgroundColor = `rgb(${124 - Math.floor(this.props.index * 35)}, ${124 - Math.floor(this.props.index * 36)}, ${124 - Math.floor(this.props.index * 3)})`;
		this.turnedOn = false;
		this.handleClick = this.handleClick.bind(this);
		this.mouseDown = this.mouseDown.bind(this);
		this.tellParent = this.tellParent.bind(this);
	}

	protected static getFontSize(s: string, modifier: number = 1): string {
		return (100 / Math.max(s.length, 45) * Constants.METHOD_NAME_TEXT_SIZE * modifier) + "px";
	}

	private handleClick(): void {
		if (this.props.active) {
			setImmediate(this.tellParent);
		}
		const state: IReactMethodState = Object.assign({}, this.state);
		state.margin = 0;
		this.setState(state);
	}

	private mouseDown(): void {
		const state: IReactMethodState = Object.assign({}, this.state);
		state.margin = Constants.LIST_ELEMENT_NEW_LINE_PX_COUNT;
		this.setState(state);
	}

	private tellParent(): void {
		this.props.tellParent(this.props.method);
	}

	public render(): ReactNode {
		const regularStyle = {display: "inline-block", verticalAlign: "middle", height: this.props.active ? "40px" : "8px"};
		const matchedStyle = {display: "inline-block", verticalAlign: "middle", height: this.props.active ? "40px" : "8px", backgroundColor: "rgb(147, 151, 203)"};
		const animation: string = this.turnedOn ? "" : `Expand ${this.fadeOutTime}ms ease-in-out`;
		if (!this.turnedOn) {
			this.turnedOn = true;
		}
		return (
			<div
				style={{
					marginLeft: this.state.margin +  "px",
					marginTop: this.props.active ? "3px" : "0",
					marginBottom: this.props.active ? "3px" : "1px",
					backgroundColor: this.backgroundColor,
					height: this.props.active ? "40px" : "8px",
					font: "100% \"Courier New\", Futura, sans-serif",
					fontSize: Method.getFontSize(this.props.method.longName, this.props.active ? 1 : 1/12),
					width: "650px",
					overflow: "hidden",
					transition: this.fadeOutTime + "ms ease-in-out",
					opacity: this.props.active ? 1 : 0.5,
					animation,
					position: "relative",
				}}
				onClick={this.handleClick}
				onMouseDown={this.mouseDown}
			>
				{
					(this.props.search === "" || !this.props.active ? [this.props.method.longName] : this.props.method.longName.split(this.props.search)).flatMap(
						(s, i, list) => list.length - 1 !== i ? [<div key={2 * i} style={regularStyle}>{s.replace(/ /g, '\u00A0')}</div>, <div key={2 * i + 1} style={matchedStyle}>{this.props.search.replace(/ /g, '\u00A0')}</div>] : <div key={2 * i} style={regularStyle}>{s.replace(/ /g, '\u00A0')}</div>,
					)
				}
			</div>
		);
	}
}

export interface IReactMethodProps extends IFadeableElementProps {
	method: IMethodTransport;
	search: string;
	tellParent: (method: IMethodTransport) => void;
	index: number;
}

export interface IReactMethodState {
	margin: number;
}