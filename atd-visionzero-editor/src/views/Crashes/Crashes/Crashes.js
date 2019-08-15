import React, { Component } from 'react';
import { Badge, Card, CardBody, CardHeader, Col, Pagination, PaginationItem, PaginationLink, Row, Table } from 'reactstrap';
import axios from 'axios';
import { CSVLink, CSVDownload } from "react-csv";
import "./Crashes.css"

class Crashes extends Component {

  constructor(props) {
    super(props);

    this.state = {
      data: null
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
            query Crashes {
            atd_txdot_crashes(limit: 100, order_by: {last_update: asc}) {
                last_update
                crash_id
                rpt_block_num
                rpt_street_name
                rpt_street_sfx
                death_cnt
                tot_injry_cnt
            }
        }

      `,
      },
    }).then(result => {
      console.log("succeeded: ");
      let data = result.data.data.atd_txdot_crashes.map(item => {
        //   Concatinate address field
        item['address'] = `${item.rpt_block_num} ${item.rpt_street_name} ${item.rpt_street_sfx}`;
        return item;
      });

      this.setState({ data: data });
    }).catch(err => {
      console.log(err);
    });
  }


  render() {
    let items = null, content = null;

    if(this.state.data !== null) {
      items = this.state.data.map((item, key) =>
        <tr key={item.crash_id} id={item.crash_id}>
          <td><a href={'#/crash/' + item.crash_id}>{item.crash_id}</a></td>
          <td>{item.rpt_block_num}</td>
          <td>{item.address}</td>
          <td>
            <Badge color="warning">{item.tot_injry_cnt}</Badge>
          </td>
          <td>
            <Badge color="danger">{item.death_cnt}</Badge>
          </td>
          <td>{item.last_update}</td>
        </tr>
      );

      content = <Card>
        <CardHeader>
          <i className="fa fa-car"></i> Crashes
        </CardHeader>
        <CardBody>
          <section style={{"margin": "5px 20px 20px 5px"}}>
            Search
            <CSVLink id="download_csv" className="btn-pill btn btn-primary" data={this.state.data}><i className="fa fa-download"></i>&nbsp;Download CSV</CSVLink>
          </section>
          <Table responsive striped>
            <thead>
            <tr>
              <th>Crash ID</th>
              <th>Block</th>
              <th>Address</th>
              <th>Total Injury Count</th>
              <th>Death Count</th>
              <th>Last Update</th>
            </tr>
            </thead>
            <tbody>
              {items}
            </tbody>
          </Table>
          <Pagination>
            <PaginationItem disabled><PaginationLink previous tag="button">Prev</PaginationLink></PaginationItem>
            <PaginationItem active>
              <PaginationLink tag="button">1</PaginationLink>
            </PaginationItem>
            <PaginationItem><PaginationLink tag="button">2</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink tag="button">3</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink tag="button">4</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink next tag="button">Next</PaginationLink></PaginationItem>
          </Pagination>
        </CardBody>
      </Card>
    } else {
      content = <h3>Loading content</h3>
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

export default Crashes;
