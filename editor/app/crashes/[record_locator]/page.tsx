"use client";
import { notFound } from "next/navigation";
import { useCallback, useEffect } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import ChangeLog from "@/components/ChangeLog";
import CrashDiagramCard from "@/components/CrashDiagramCard";
import CrashHeader from "@/components/CrashHeader";
import CrashIsTemporaryBanner from "@/components/CrashIsTemporaryBanner";
import CrashLocationBanner from "@/components/CrashLocationBanner";
import CrashMapCard from "@/components/CrashMapCard";
import CrashNarrativeCard from "@/components/CrashNarrativeCard";
import CrashRecommendationCard from "@/components/CrashRecommendationCard";
import CrashSwapAddressButton from "@/components/CrashSwapAddressButton";
import DataCard from "@/components/DataCard";
import NotesCard from "@/components/NotesCard";
import RelatedRecordTable from "@/components/RelatedRecordTable";
import { chargeRelatedRecordCols } from "@/configs/chargeRelatedRecordTable";
import { crashDataCards } from "@/configs/crashDataCard";
import { crashNotesColumns } from "@/configs/notesColumns";
import { peopleRelatedRecordCols } from "@/configs/peopleRelatedRecordTable";
import { emsRelatedRecordCols } from "@/configs/emsRelatedRecordTable";
import { unitRelatedRecordCols } from "@/configs/unitRelatedRecordTable";
import { GET_CRASH, UPDATE_CRASH } from "@/queries/crash";
import { INSERT_CRASH_NOTE, UPDATE_CRASH_NOTE } from "@/queries/crashNotes";
import { UPDATE_PERSON } from "@/queries/person";
import { UPDATE_UNIT } from "@/queries/unit";
import { Crash } from "@/types/crashes";
import { ShortcutKeyLookup } from "@/types/keyboardShortcuts";
import { useQuery } from "@/utils/graphql";
import {
  scrollToElementOnKeyPress,
  useKeyboardShortcut,
} from "@/utils/shortcuts";
import { formatAddresses } from "@/utils/formatters";
import EMSCardHeader from "@/components/EMSCardHeader";

const typename = "crashes";

// Lookup object that maps key shortcuts to the associated DOM element id to scroll to
const shortcutKeyLookup: ShortcutKeyLookup[] = [
  { key: "A", elementId: "address" },
  { key: "U", elementId: "units" },
  { key: "P", elementId: "people" },
  { key: "E", elementId: "ems" },
  { key: "C", elementId: "charges" },
  { key: "N", elementId: "notes" },
  { key: "F", elementId: "fatality" },
];

export default function CrashDetailsPage({
  params,
}: {
  params: { record_locator: string };
}) {
  const recordLocator = params.record_locator;

  // Call hook to watch out for the use of keyboard shortcuts
  useKeyboardShortcut(shortcutKeyLookup, scrollToElementOnKeyPress);

  const { data, error, refetch, isValidating } = useQuery<Crash>({
    query: recordLocator ? GET_CRASH : null,
    variables: { recordLocator },
    typename,
  });

  if (error) {
    console.error(error);
  }

  const onSaveCallback = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // When data is loaded or updated this sets the title of the page inside the HTML head element
  useEffect(() => {
    if (!!data) {
      document.title = `${data[0].record_locator} - ${formatAddresses(data[0])}`;
    }
  }, [data]);

  if (!data) {
    // todo: loading spinner (would be nice to use a spinner inside cards)
    return;
  }

  if (data.length === 0) {
    // 404
    notFound();
  }

  const crash = data[0];

  return (
    <>
      <CrashHeader crash={crash} />
      {
        // show alert if crash on private drive or outside of Austin full purpose
        (crash.private_dr_fl || !crash.in_austin_full_purpose) && (
          <CrashLocationBanner privateDriveFlag={crash.private_dr_fl} />
        )
      }
      {
        // show alert if crash is a temp record
        crash.is_temp_record && <CrashIsTemporaryBanner crashId={crash.id} />
      }
      <Row>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <CrashMapCard
            savedLatitude={crash.latitude}
            savedLongitude={crash.longitude}
            crashId={crash.id}
            onSaveCallback={onSaveCallback}
            mutation={UPDATE_CRASH}
            locationId={crash.location_id}
            isManualGeocode={crash.crashes_list_view.is_manual_geocode}
          />
        </Col>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <CrashDiagramCard crash={crash} />
        </Col>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <CrashNarrativeCard crash={crash} />
        </Col>
      </Row>
      <Row>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <DataCard<Crash>
            record={crash}
            isValidating={isValidating}
            title="Summary"
            columns={crashDataCards.summary}
            mutation={UPDATE_CRASH}
            onSaveCallback={onSaveCallback}
          />
        </Col>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <DataCard<Crash>
            record={crash}
            isValidating={isValidating}
            title="Flags"
            columns={crashDataCards.flags}
            mutation={UPDATE_CRASH}
            onSaveCallback={onSaveCallback}
            shouldShowColumnVisibilityPicker={true}
            localStorageKey="crashPageFlags"
          />
        </Col>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <DataCard<Crash>
            record={crash}
            isValidating={isValidating}
            title="Other"
            columns={crashDataCards.other}
            mutation={UPDATE_CRASH}
            onSaveCallback={onSaveCallback}
            shouldShowColumnVisibilityPicker={true}
            localStorageKey="crashPageOther"
          />
        </Col>
      </Row>
      <Row id="address">
        <Col sm={12} md={6} lg={4} className="mb-3">
          <DataCard<Crash>
            record={crash}
            isValidating={isValidating}
            title="Primary address"
            columns={crashDataCards.address}
            mutation={UPDATE_CRASH}
            onSaveCallback={onSaveCallback}
            headerActionComponent={CrashSwapAddressButton}
          />
        </Col>
        <Col sm={12} md={6} lg={4} className="mb-3">
          <DataCard<Crash>
            record={crash}
            isValidating={isValidating}
            title="Secondary address"
            columns={crashDataCards.address_secondary}
            mutation={UPDATE_CRASH}
            onSaveCallback={onSaveCallback}
          />
        </Col>
      </Row>
      <Row id="units">
        <Col sm={12} className="mb-3">
          <RelatedRecordTable
            records={crash.units || []}
            isValidating={isValidating}
            noRowsMessage="No unit records found"
            header="Units"
            columns={unitRelatedRecordCols}
            mutation={UPDATE_UNIT}
            onSaveCallback={onSaveCallback}
            shouldShowColumnVisibilityPicker={true}
            localStorageKey="crashPageUnits"
          />
        </Col>
      </Row>
      <Row id="people">
        <Col sm={12} className="mb-3">
          <RelatedRecordTable
            records={crash.people_list_view || []}
            isValidating={isValidating}
            noRowsMessage="No people records found"
            header="People"
            columns={peopleRelatedRecordCols}
            mutation={UPDATE_PERSON}
            onSaveCallback={onSaveCallback}
            shouldShowColumnVisibilityPicker={true}
            localStorageKey="crashPagePeople"
          />
        </Col>
      </Row>
      <Row id="ems">
        <Col sm={12} className="mb-3">
          <RelatedRecordTable
            records={crash.ems__incidents || []}
            isValidating={isValidating}
            header={<EMSCardHeader />}
            noRowsMessage="No EMS records found"
            columns={emsRelatedRecordCols}
            mutation=""
            onSaveCallback={onSaveCallback}
            shouldShowColumnVisibilityPicker={true}
            localStorageKey="crashPageEmsPatientCare"
          />
        </Col>
      </Row>
      <Row id="charges">
        <Col sm={12} className="mb-3">
          <RelatedRecordTable
            records={crash.charges_cris || []}
            isValidating={isValidating}
            noRowsMessage="No charge records found"
            header="Charges"
            columns={chargeRelatedRecordCols}
            mutation={""}
            onSaveCallback={onSaveCallback}
          />
        </Col>
      </Row>
      <Row id="notes">
        <Col sm={12} className="mb-3">
          <NotesCard
            notes={crash.crash_notes || []}
            notesColumns={crashNotesColumns}
            updateMutation={UPDATE_CRASH_NOTE}
            insertMutation={INSERT_CRASH_NOTE}
            onSaveCallback={onSaveCallback}
            recordId={crash.id}
            refetch={onSaveCallback}
          />
        </Col>
      </Row>
      <Row id="fatality">
        <Col sm={12} md={6} className="mb-3">
          <CrashRecommendationCard
            recommendation={crash.recommendation}
            crash_pk={crash.id}
            onSaveCallback={onSaveCallback}
          />
        </Col>
      </Row>
      <Row>
        <Col>{crash && <ChangeLog logs={crash.change_logs || []} />}</Col>
      </Row>
    </>
  );
}
