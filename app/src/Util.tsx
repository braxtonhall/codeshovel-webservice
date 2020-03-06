import {ReactNode} from "react";
import * as React from "react";

export class OutsideAlerter extends React.Component<{child: ReactNode, handleClick: () => void}, {}> {
	private wrapperRef: any;

	constructor(props: {child: ReactNode, handleClick: () => void}) {
		super(props);

		this.setWrapperRef = this.setWrapperRef.bind(this);
		this.handleClickOutside = this.handleClickOutside.bind(this);
	}

	public componentDidMount(): void {
		document.addEventListener("mousedown", this.handleClickOutside);
	}

	public componentWillUnmount(): void {
		document.removeEventListener("mousedown", this.handleClickOutside);
	}

	public setWrapperRef(node: any): void {
		this.wrapperRef = node;
	}

	public handleClickOutside(event: Event): void {
		if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
			this.props.handleClick();
		}
	}

	public render(): ReactNode {
		return <div ref={this.setWrapperRef}>{this.props.child}</div>;
	}
}