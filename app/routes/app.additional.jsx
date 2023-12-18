import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  Badge,
  VerticalStack,
} from "@shopify/polaris";

export default function AdditionalPage() {
  const videoStyle = {
    height: "500px",
    width: "100%",
    borderRadius: "10px",
  };
  return (
    <Page>
      <ui-title-bar title={`QuickTrack | Order Tracking `} />
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="h1" variant="bodyLg" style={{ fontSize: "20px" }}>
              <b>
                Follow these steps to set up the "QuickTrack | Order Tracking"
                app and manage everything
              </b>
            </Text>
            <Badge status="attention"> </Badge>

            <Text as="p" variant="bodyMd">
              <b>1. Select the tracking progress bar status : </b>
              On the tracking page, There are some default status if you add
              then there is an option to add more statuses, you have to option
              to remove and edit status.
            </Text>

            <Text as="p" variant="bodyMd">
              <b>2. Search order : </b>
              In the order tracking status page, search the order that you went
              to update status.
            </Text>

            <Text as="p" variant="bodyMd">
              <b>3. Status Setup : </b>
              Click the <b>Status button</b> then open a new page with order
              details and tracking information.
            </Text>

            <Text as="p" variant="bodyMd">
              <b>4. Tracking information : </b>
              In the Tracking information section select the order current
              status and Estimated Delivery Date for delivery the order.
            </Text>

            <Text as="p" variant="bodyMd">
              <b>5. View in Store : </b>
              Click the <b>View in store</b> button to manage the app in your
              store.
            </Text>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <Text as="h1" variant="bodyLg" style={{ fontSize: "20px" }}>
              <b>Full Set Up Instraction in One Video</b>
            </Text>
            <Badge status="attention"> </Badge>
            <Card>
              <iframe
                title="Countdown app set up isnstruction Video"
                style={videoStyle}
                src="https://www.youtube.com/embed/6k6VLRn8lZ0"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </Card>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function Code({ children }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="1"
      paddingInlineEnd="1"
      background="bg-subdued"
      borderWidth="1"
      borderColor="border"
      borderRadius="1"
    >
      <code>{children}</code>
    </Box>
  );
}
