import React, { useState } from "react";
import { Button } from "reactstrap";
import ConfirmModal from "../../Components/ConfirmModal";
import { UPDATE_CRASH } from "../../queries/crashes";

const SwapAddressButton = ({ data, crashRefetch, ...props }) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const crash = data?.crash;

  const toggleModal = () => {
    setIsConfirmModalOpen(!isConfirmModalOpen);
  };

  const onConfirm = () => {
    props.client
      .mutate({
        mutation: UPDATE_CRASH,
        variables: {
          id: crash.id,
          changes: {
            rpt_block_num: crash.rpt_sec_block_num,
            rpt_street_name: crash.rpt_sec_street_name,
            rpt_street_desc: crash.rpt_sec_street_desc,
            rpt_road_part_id: crash.rpt_sec_road_part_id,
            rpt_rdwy_sys_id: crash.rpt_sec_rdwy_sys_id,
            rpt_hwy_num: crash.rpt_sec_hwy_num,
            rpt_street_pfx: crash.rpt_sec_street_pfx,
            rpt_street_sfx: crash.rpt_sec_street_sfx,
            rpt_sec_block_num: crash.rpt_block_num,
            rpt_sec_street_name: crash.rpt_street_name,
            rpt_sec_street_desc: crash.rpt_street_desc,
            rpt_sec_road_part_id: crash.rpt_road_part_id,
            rpt_sec_rdwy_sys_id: crash.rpt_rdwy_sys_id,
            rpt_sec_hwy_num: crash.rpt_hwy_num,
            rpt_sec_street_pfx: crash.rpt_street_pfx,
            rpt_sec_street_sfx: crash.rpt_street_sfx,
          },
        },
      })
      .then(res => crashRefetch());
  };

  return (
    <div className="float-right">
      <Button color="primary" onClick={toggleModal} size="sm">
        Swap Addresses
        <i className="ml-2 fa fa-refresh" />
      </Button>
      <ConfirmModal
        showModal={isConfirmModalOpen}
        toggleModal={toggleModal}
        modalHeader={"Swap addresses?"}
        modalBody={
          "Are you sure you want to swap the primary and secondary address?"
        }
        confirmClick={onConfirm}
      />
    </div>
  );
};

export default SwapAddressButton;
