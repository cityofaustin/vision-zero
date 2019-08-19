import React, { Component } from "react";

import {
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Table,
    Row,
    Modal, ModalHeader, ModalBody, ModalFooter
} from "reactstrap";


import {Link} from "react-router-dom";

class CrashChangeLog extends Component {
    constructor(props) {
        super(props);

        this.closeModal = this.closeModal.bind(this);
        this.showModal = this.showModal.bind(this);

        this.setCompareFrom = this.setCompareTo.bind(this);
        this.setCompareTo = this.setCompareTo.bind(this);

        this.compare = this.compare.bind(this);

        this.state = {
            modal: false,
            modalBody: null,
            dataFrom: null,
            dataTo: null,
            data: this.props.data
        };
    }

    timeConverter(UNIX_timestamp){
        var a = new Date(`${UNIX_timestamp}`.replace(' ', 'T'));
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min;
        return time;
    }

    showModal() {
        this.setState({
            modal: true
        });
    }

    closeModal() {
        this.setState({
            modal: false,
            modalBody: null
        });
    }

    setCompareFrom(event) {
        this.setState({dataFrom: event.target.value});
    }

    setCompareTo(event) {
        this.setState({dataTo: event.target.value});
    }

    compare(record) {

        let diff = [];

        let modalBody = null;

        for (let [key, value] of Object.entries(this.props.data.atd_txdot_crashes[0])) {
            if(key === "__typename") continue;
            try {
                let archivedRecordValue = record.record_json[key];

                if(archivedRecordValue !== value) {
                    diff.push({
                        'original_record_key': key,
                        'original_record_value': value,
                        'archived_record_value': archivedRecordValue
                    });
                } else {
                    console.log(`${key} -- ${value} -- ${archivedRecordValue}`);
                }

            } catch (error) {
                console.log(error);
            }
        }


        let modalItems = diff.map(item => (
            <tr key={record.id}>
                <td>
                    {item.original_record_key}
                </td>
                <td>
                    <Badge color="primary">{String(item.original_record_value)}</Badge>
                </td>
                <td>
                    <Badge color="danger">{String(item.archived_record_value)}</Badge>
                </td>
            </tr>
        ));



        modalBody = <section>
            <h6>Crash ID: <Badge color={"secondary"} className={"float-right"}>{record.record_crash_id}</Badge></h6>
            <h6>Archive Date: <Badge color={"secondary"} className={"float-right"}>{record.update_timestamp}</Badge></h6>
            <h6>Created by: <Badge color={"secondary"} className={"float-right"}>{record.record_json.updated_by}</Badge></h6>
            &nbsp;
            <Table responsive>
                <thead>
                <tr>
                    <td>Field</td>
                    <td>Current Value</td>
                    <td>Archived Value</td>
                    <td></td>
                </tr>
                </thead>
                <tbody>
                    {modalItems}
                </tbody>
            </Table>
        </section>;

        this.setState({
            modalBody: modalBody
        });
        this.showModal();
    }

    render() {
        let modal = null, content = null;
        // If there are no records, let's not render anything...
        if(this.props.data.atd_txdot_change_log.length == 0) {
            modal = null;
            content = <h4>No changes found for this record.</h4>;
        } else {
            modal = <Modal isOpen={this.state.modal} className={this.props.className}>
                <ModalHeader>Record Differences</ModalHeader>
                <ModalBody>
                    {this.state.modalBody}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={this.closeModal}>Close</Button>
                </ModalFooter>
            </Modal>;
            content = <>
                <h4>Record History</h4>

                <Table responsive>
                    <thead>
                    <tr>
                        <td>ChangeLog ID</td>
                        <td>Date Archived</td>
                        <td>Updated by</td>
                        <td></td>
                    </tr>
                    </thead>
                    <tbody>
                    {this.props.data.atd_txdot_change_log.map(record => (
                        <tr key={record.id}>
                            <td>
                                <Link to={`crashes/${record.id}`}>
                                    {record.id}
                                </Link>
                            </td>
                            <td>
                                <Badge color="warning">{this.timeConverter(record.update_timestamp)}</Badge>
                            </td>
                            <td>
                                <Badge color="danger">{String(record.updated_by)} </Badge>
                            </td>
                            <td>
                                <Button color="primary" size="sm"
                                        onClick={() => this.compare(record)}>Compare</Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </>;
        }

        // Render Box
        return (
            <div className="animated fadeIn">
                {modal}
                <Row>
                    <Col>
                        <Card>
                            <CardHeader>
                                <i className="fa fa-align-justify"/> Change Log
                            </CardHeader>
                            <CardBody>
                                {content}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );

    }
}


export default CrashChangeLog;
