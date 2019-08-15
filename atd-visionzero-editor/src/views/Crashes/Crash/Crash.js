import React, { Component } from 'react';
import { Badge, Card, CardBody, CardHeader, Col, Pagination, PaginationItem, PaginationLink, Row, Table } from 'reactstrap';
import axios from 'axios';
import { CSVLink, CSVDownload } from "react-csv";
import "./Crash.css"

class Crash extends Component {

  constructor(props) {
    super(props);


    let crash_id = props.location.pathname.split("/")[2] || null;


    this.state = {
      data: null,
      crash_id: crash_id
    };

    this.loadRecords();
  }

  loadRecords() {
    console.log("Loading records...");
    axios({
      url: 'https://vzd.austintexas.io/v1/graphql',
      method: 'post',
      headers: {
        'x-hasura-admin-secret': '<YOUR_HASURA_CODE>',
        'content-type': 'application/json',
      },
      data: {
        query: `
            query Crashes
            {
                atd_txdot_crashes(where: {crash_id: {_eq: ${this.state.crash_id}}})
                {
                  crash_id
                  geocoded
                  geocode_date
                  geocode_provider
                  geocode_status
                  crash_time
                  crash_date
                  case_id
                  approval_date
                  approved_by
                  city_id
                  crash_fatal_fl
                  latitude
                  longitude
                  longitude_geocoded
                  longitude_confirmed
                  rpt_street_name
                  rpt_street_desc
                  rpt_street_sfx
                  rpt_street_pfx
                  rpt_longitude
                  rpt_latitude
                  street_name
                  street_nbr
                  rpt_city_id
                  rpt_block_num
                  rpt_hwy_num
                  rpt_hwy_sfx
                }
              
            }
      `,
      },
    }).then(result => {
      let totalRows = result.data.data.atd_txdot_crashes.length || 0;

      if(totalRows == 0) {
        this.setState({ data: -1 });
      } else {
        let data = result.data.data.atd_txdot_crashes.map(item => {
          //   Concatinate address field
          item['address'] = `${item.rpt_block_num} ${item.rpt_street_name} ${item.rpt_street_sfx}`;
          return item;
        });

        this.setState({ data: data[0] });
      }
    }).catch(err => {
      console.log(err);
    });
  }


  render() {
    let items = null, content = null;

    if(this.state.data !== null && this.state.data !== -1) {
      console.log("We have data: ");
      let listItems = Object.keys(this.state.data).map(key =>
        <li className="justify-content-between list-group-item">{key}<span
          className="float-right">{this.state.data[key]}</span></li>
      );

      content = <div className="col-12">
        <ul className="nav nav-tabs">
          <li className="nav-item"><a className="nav-link active"><i className="icon-calculator"></i> <span
            className=""> Details</span></a></li>
          <li className="nav-item"><a className="nav-link"><i className="icon-basket-loaded"></i> <span
            className="d-none"> Edit</span></a></li>
          <li className="nav-item"><a className="nav-link"><i className="icon-pie-chart"></i> <span
            className="d-none"> Share</span></a></li>
        </ul>
        <div className="tab-content">
          <div className="tab-pane active">
            <ul className="list-group">
              {listItems}
            </ul>
          </div>
          <div className="tab-pane">THIS IS THE EDIT PAGE
          </div>
          <div className="tab-pane">THIS IS THE SHARE PAGE
          </div>
        </div>
      </div>
    } else if(this.state.data == -1) {
      console.log("We have no data");
        content = <h3>No Record Found</h3>
    } else {
      console.log("Loading");
      content = <h3>Loading Record</h3>
    }




    return (
      <div className="animated fadeIn">

        <Row>
          <Col xs="12" lg="12">
            {content}
          </Col>
        </Row>

      </div>

    );
  }
}

export default Crash;
