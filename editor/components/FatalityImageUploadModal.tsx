import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import { Dispatch, SetStateAction } from "react";

interface FatalityImageUploadModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  victimName: string;
}

export default function FatalityImageUploadModal({
  showModal,
  setShowModal,
  victimName,
}: FatalityImageUploadModalProps) {
  return (
    <Modal show={showModal} size="lg" onHide={() => setShowModal(false)}>
      <Modal.Header>
        <Modal.Title>{`Photo | ${victimName}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={(e) => e.preventDefault()}>
          <Row>
            <Col>
              <Form.Control type="file" name="file" />
            </Col>
            <Col>
              <InputGroup>
                <InputGroup.Text id="basic-addon1">
                  Image source
                </InputGroup.Text>
                <Form.Control placeholder="https://www.legacy.com/us/obituaries/statesman/" />
              </InputGroup>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          type="submit"
          // disabled={isSubmitting}
        >
          Save
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setShowModal(false);
          }}
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
