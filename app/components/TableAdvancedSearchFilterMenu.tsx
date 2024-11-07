import { Dispatch, SetStateAction } from "react";
import { produce } from "immer";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { QueryConfig, FilterGroup } from "@/utils/queryBuilder";
import Card from "react-bootstrap/Card";

interface TableSearchProps {
  queryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
}

interface FilterCardConfig {
  cardId: string;
  label: string;
  switches: FilterGroup[];
}

const DEFAULT_SWITCHES_ENABLED = [
  { cardId: "geography_filter_card", filterId: "in_austin_full_purpose" },
];

const filterCards: FilterCardConfig[] = [
  {
    cardId: "injuries_filter_card",
    label: "Injuries",
    switches: [
      {
        id: "vz_fatality_crashes",
        label: "Fatal crashes - Vision Zero",
        groupOperator: "_and",
        filters: [
          {
            id: "vz_fatality_crashes",
            column: "vz_fatality_count",
            operator: "_gt",
            value: 0,
          },
        ],
      },
      {
        id: "cris_fatality_crashes",
        label: "Fatal crashes - CRIS",
        groupOperator: "_and",
        filters: [
          {
            id: "cris_fatality_crashes",
            column: "cris_fatality_count",
            operator: "_gt",
            value: 0,
          },
        ],
      },
      {
        id: "law_enforcement_fatality_crashes",
        label: "Fatal crashes - Law enforcement",
        groupOperator: "_and",
        filters: [
          {
            id: "law_enforcement_fatality_crashes",
            column: "law_enf_fatality_count",
            operator: "_gt",
            value: 0,
          },
        ],
      },

      {
        id: "suspected_serious_injury_crashes",
        label: "Suspected serious injury crashes",
        groupOperator: "_and",
        filters: [
          {
            id: "suspected_serious_injury_crashes",
            column: "sus_serious_injry_count",
            operator: "_gt",
            value: 0,
          },
        ],
      },
    ],
  },
  {
    cardId: "units_filter_card",
    label: "Units involved",
    switches: [
      {
        id: "motor_vehicle",
        label: "Motor vehicle",
        groupOperator: "_and",
        filters: [
          {
            id: "unit_description",
            column: "unit_desc_id",
            operator: "_eq",
            value: 1,
            relationshipName: "units",
          },
          {
            id: "vehicle_body_style",
            column: "veh_body_styl_id",
            operator: "_nin",
            value: [71, 90],
            relationshipName: "units",
          },
        ],
      },
      //todo: check these _and vs _or
      {
        id: "motorcycle",
        label: "Motorcycle",
        groupOperator: "_and",
        filters: [
          {
            id: "unit_description",
            column: "unit_desc_id",
            operator: "_eq",
            value: 1,
            relationshipName: "units",
          },
          {
            id: "vehicle_body_style",
            column: "veh_body_styl_id",
            operator: "_in",
            value: [71, 90],
            relationshipName: "units",
          },
        ],
      },

      {
        id: "cyclist",
        label: "Cyclist",
        groupOperator: "_and",
        filters: [
          {
            id: "unit_description",
            column: "unit_desc_id",
            operator: "_eq",
            value: 3,
            relationshipName: "units",
          },
        ],
      },
      {
        id: "pedestrian",
        label: "Pedestrian",
        groupOperator: "_and",
        filters: [
          {
            id: "unit_description",
            column: "unit_desc_id",
            operator: "_eq",
            value: 4,
            relationshipName: "units",
          },
        ],
      },

      {
        id: "scooter_rider",
        label: "E-scooter rider",
        groupOperator: "_or",
        filters: [
          {
            id: "unit_description",
            column: "unit_desc_id",
            operator: "_eq",
            value: 77,
            relationshipName: "units",
          },
          {
            id: "vehicle_body_style",
            column: "veh_body_styl_id",
            operator: "_eq",
            value: 177,
            relationshipName: "units",
          },
        ],
      },
      // todo: "Other" sitch
    ],
  },
  {
    cardId: "geography_filter_card",
    label: "Geography",
    switches: [
      {
        id: "in_austin_full_purpose",
        label: "In Austin Full Purpose jurisdiction",
        groupOperator: "_and",
        filters: [
          {
            id: "in_austin_full_purpose",
            column: "in_austin_full_purpose",
            operator: "_eq",
            value: true,
          },
        ],
      },
    ],
  },
  {
    cardId: "internal_filters",
    label: "Internal",
    switches: [
      {
        id: "private_drive",
        label: "Private drive crashes",
        groupOperator: "_and",
        filters: [
          {
            id: "private_drive",
            column: "private_dr_fl",
            operator: "_eq",
            value: true,
          },
        ],
      },
    ],
  },
];

/**
 * Count how many switch filters are present
 */
export const getActiveSwitchFilterCount = (
  filterGroups: FilterGroup[]
): number => {
  //
  let count = 0;
  filterGroups.forEach((filterGroup) => {
    if (filterGroup.filters) {
      return;
    } else {
      count += filterGroup.filterGroups.length;
    }
  });
  return count;
};

/**
 * Initialize default filter switches that should be turned on
 * - e.g In Austin Full purpose
 *
 * todo// tighten up typing
 */
export const getDefaultFilterGroups = (): FilterGroup[] => {
  let filterGroups: FilterGroup[] = [];
  DEFAULT_SWITCHES_ENABLED.forEach(({ cardId, filterId }) => {
    const group = filterCards
      .find((card) => card.cardId === cardId)
      ?.switches.find((filterGroup) => filterGroup.id === filterId);
    if (group) {
      filterGroups = [
        ...filterGroups,
        // todo: this should be resuable "make outer filter group function"
        {
          id: cardId,
          groupOperator: "_or",
          filterGroups: [group],
        },
      ];
    }
  });
  return filterGroups;
};

const findSwitchFilterGroup = (
  queryConfig: QueryConfig,
  cardId: string,
  switchConfigId: string
) => {
  return queryConfig.filterGroups
    ?.find((filterGroup) => filterGroup.id === cardId)
    ?.filterGroups?.find(
      (nestedFilterGroup) => nestedFilterGroup.id === switchConfigId
    );
};

/**
 * Switch on a filter by adding its group to the query config
 */
const addFilters = (
  queryConfig: QueryConfig,
  switchFilterGroup: FilterGroup,
  cardId: string
) => {
  // check if we already have a group of filters defined for this card
  let filterCardGroup: FilterGroup | undefined = queryConfig.filterGroups.find(
    (filterGroup) => filterGroup.id === cardId
  );
  // if we don't have a filter group for this card, make one
  if (!filterCardGroup) {
    filterCardGroup = {
      // todo: this should be resuable "make outer filter group function"
      id: cardId,
      groupOperator: "_or",
      filterGroups: [switchFilterGroup],
    };
    // add to query config
    queryConfig.filterGroups.push(filterCardGroup);
  } else {
    // card filter group already exists, so add this one to it
    filterCardGroup.filterGroups?.push(switchFilterGroup);
  }
  return queryConfig;
};

/**
 * Switch off a filter by removing its group from the query config
 * @returns
 */
const removeFilters = (
  queryConfig: QueryConfig,
  switchFilterGroupId: string,
  cardId: string
) => {
  // get the index of this filter card
  const filterGroupIdx = queryConfig.filterGroups.findIndex(
    (filterGroup) => filterGroup.id === cardId
  );

  if (queryConfig.filterGroups?.[filterGroupIdx]) {
    // find this switch filter group
    const newFilterGroupIdx = queryConfig.filterGroups[
      filterGroupIdx
    ].filterGroups?.findIndex(
      (switchFilterGroup) => switchFilterGroup.id === switchFilterGroupId
    );

    if (newFilterGroupIdx !== undefined && newFilterGroupIdx > -1) {
      // and splice it out
      queryConfig.filterGroups[filterGroupIdx]?.filterGroups?.splice(
        newFilterGroupIdx,
        1
      );
    }
  } else {
    // should never happen
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
      {filterCards.map((filterCard) => {
        return (
          <Col key={filterCard.cardId}>
            <Card>
              <Card.Header>
                {filterCard.label}
                <span className="ms-2">{"(match any)"}</span>
              </Card.Header>
              <Card.Body>
                <Form>
                  {filterCard.switches.map((switchFilterGroup) => {
                    const isChecked = Boolean(
                      findSwitchFilterGroup(
                        queryConfig,
                        filterCard.cardId,
                        switchFilterGroup.id
                      )
                    );
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
                              if (!isChecked) {
                                return addFilters(
                                  newQueryConfig,
                                  switchFilterGroup,
                                  filterCard.cardId
                                );
                              } else {
                                return removeFilters(
                                  newQueryConfig,
                                  switchFilterGroup.id,
                                  filterCard.cardId
                                );
                              }
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
