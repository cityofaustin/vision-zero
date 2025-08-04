import { Dispatch, SetStateAction } from "react";
import { produce } from "immer";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { QueryConfig, FilterGroup } from "@/types/queryBuilder";

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
): QueryConfig => {
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
    <>
      {queryConfig.filterCards.map((filterCard) => {
        return (
          <Row className="p-2" key={filterCard.id}>
            <Col>
              <Card className="h-100">
                <Card.Header className="fw-bold">
                  {filterCard.label}
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
                              (newQueryConfig: QueryConfig) => {
                                // reset offset/pagination
                                newQueryConfig.offset = 0;
                                // enable or remove filters
                                flipSwitchFilter(
                                  newQueryConfig,
                                  filterCard.id,
                                  switchFilterGroup.id
                                );
                                return newQueryConfig;
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
          </Row>
        );
      })}
    </>
  );
}
