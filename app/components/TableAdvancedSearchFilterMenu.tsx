import { Dispatch, SetStateAction } from "react";
import { produce } from "immer";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { QueryConfig, FilterGroup } from "@/utils/queryBuilder";

interface TableSearchProps {
  queryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
}

/**
 * Switch on/off a filter by setting it's enabled property
 */
const flipSwitchFilter = (
  queryConfig: QueryConfig,
  filterCardId: string,
  switchFilterId: string
) => {
  // find this card
  const filterCardGroup: FilterGroup | undefined = queryConfig.filterCards.find(
    (filterGroup) => filterGroup.id === filterCardId
  );

  if (!filterCardGroup) {
    // should never happen
    return queryConfig;
  }

  // find the switch (should always be found)
  const switchFilter = filterCardGroup.filterGroups?.find(
    (switchFilter) => switchFilter.id === switchFilterId
  );

  // flip it
  if (switchFilter) {
    switchFilter.enabled = !switchFilter.enabled;
  }

  return queryConfig;
};

/**
 * Component that controls advanced search filter switches
 */
export default function TableAdvancedSearchFilterMenu({
  queryConfig,
  setQueryConfig,
}: TableSearchProps) {
  return (
    <Row className="p-2 bg-light">
      {queryConfig.filterCards.map((filterCard) => {
        return (
          <Col key={filterCard.id}>
            <Card>
              <Card.Header>
                {filterCard.label}
                {/* todo: showing the group operator here just for debug help */}
                <span className="ms-2">{`(match: ${filterCard.groupOperator})`}</span>
              </Card.Header>
              <Card.Body>
                <Form>
                  {filterCard.filterGroups?.map((switchFilterGroup) => {
                    const isChecked = switchFilterGroup.inverted
                      ? !switchFilterGroup.enabled
                      : !!switchFilterGroup.enabled;

                    return (
                      <Form.Check
                        key={switchFilterGroup.id}
                        type="switch"
                        id={switchFilterGroup.id}
                        label={switchFilterGroup.label}
                        checked={isChecked}
                        onChange={() => {
                          const newQueryConfig = produce(
                            queryConfig,
                            (newQueryConfig) => {
                              // reset offset/pagination
                              newQueryConfig.offset = 0;
                              // enable or remove filters
                              return flipSwitchFilter(
                                newQueryConfig,
                                filterCard.id,
                                switchFilterGroup.id
                              );
                            }
                          );
                          setQueryConfig(newQueryConfig);
                        }}
                      />
                    );
                  })}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
