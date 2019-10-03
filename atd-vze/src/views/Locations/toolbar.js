/* global setTimeout */
import React, { PureComponent } from "react";
import styled from "styled-components";
import { EditorModes } from "react-map-gl-draw";
import { Button } from "reactstrap";
import { colors } from "../../styles/colors";

// Add or remove editor modes here
// https://github.com/uber/nebula.gl/tree/master/modules/react-map-gl-draw
const MODES = [
  { id: EditorModes.EDITING, text: "Edit Feature", icon: "icon-select.svg" },
  {
    id: EditorModes.DRAW_POLYGON,
    text: "Draw Polygon",
    icon: "icon-polygon.svg",
  },
];

const Container = styled.div`
  position: absolute;
  width: 36px;
  right: 24px;
  top: 72px;
  background: ${colors.white};
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.15);
  outline: none;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const Row = styled.div`
  height: 36px;
  padding: 0px;
  display: flex;
  justify-content: left;
  color: ${props => (props.selected ? `${colors.white}` : "inherit")};
  background: ${props =>
    props.selected
      ? `${colors.primary}`
      : props.hovered
      ? `${colors.secondary}`
      : "inherit"};
`;

const Img = styled.img`
  width: inherit;
  height: inherit;
`;

const Tooltip = styled.div`
  position: absolute;
  right: 52px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.8);
  color: ${colors.white};
  min-width: 100px;
  max-width: 300px;
  height: 24px;
  font-size: 12px;
  z-index: 9;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SubmitButton = styled.div`
  position: absolute;
  right: 24px;
  bottom: 24px;
`;

const Reset = styled(Row)`
  &:hover {
    background: ${props =>
      props.selected ? `${colors.primary}` : `${colors.secondary}`};
  }
  &:active: {
    background: ${props => (props.selected ? `${colors.primary}` : "inherit")};
  }
`;

const Delete = styled(Row)`
  &:hover {
    background: ${props =>
      props.selected ? `${colors.primary}` : `${colors.secondary}`};
  }
  &:active: {
    background: ${props => (props.selected ? `${colors.primary}` : "inherit")};
  }
`;

export default class Toolbar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      deleting: false,
      resetting: false,
      hoveredId: null,
    };
  }

  _onHover = evt => {
    this.setState({ hoveredId: evt && evt.target.id });
  };

  _onReset = evt => {
    this.props.onReset();
    this.setState({ resetting: true });
    setTimeout(() => this.setState({ resetting: false }), 500);
  };

  _onDelete = evt => {
    this.props.onDelete(evt);
    this.setState({ deleting: true });
    setTimeout(() => this.setState({ deleting: false }), 500);
  };

  render() {
    const { selectedMode } = this.props;
    const { hoveredId } = this.state;

    return (
      <>
        <Container>
          {MODES.map(m => {
            return (
              <Row
                onClick={this.props.onSwitchMode}
                onMouseOver={this._onHover}
                onMouseOut={_ => this._onHover(null)}
                selected={m.id === selectedMode}
                hovered={m.id === hoveredId}
                key={m.id}
                id={m.id}
              >
                <Img
                  id={m.id}
                  onMouseOver={this._onHover}
                  src={`/assets/img/${m.icon}`}
                />
                {hoveredId === m.id && <Tooltip>{m.text}</Tooltip>}
              </Row>
            );
          })}
          <Reset
            selected={this.state.resetting}
            onMouseOver={this._onHover}
            onMouseOut={_ => this._onHover(null)}
          >
            <Img
              id={"reset"}
              onMouseOver={this._onHover}
              onClick={this._onReset}
              src={"/assets/img/icon-refresh.svg"}
            />
            {hoveredId === "reset" && <Tooltip>{"Reset Polygon"}</Tooltip>}
          </Reset>
          <Delete
            selected={this.state.deleting}
            onClick={this._onDelete}
            onMouseOver={this._onHover}
            onMouseOut={_ => this._onHover(null)}
          >
            <Img
              id={"delete"}
              onMouseOver={this._onHover}
              onClick={this._onDelete}
              src={"/assets/img/icon-delete.svg"}
            />
            {hoveredId === "delete" && <Tooltip>{"Delete"}</Tooltip>}
          </Delete>
        </Container>
        <SubmitButton>
          <Button onClick={this.props.onSubmit} block color="success">
            {this.props.isSubmitting ? "Submitting..." : "Submit Changes"}
          </Button>
        </SubmitButton>
      </>
    );
  }
}
