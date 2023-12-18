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
              <b>1. Search the product to setup: </b>
              On the home page, there will be a search option if we went to find
              the product, then search.And, click the <b>Settings</b> button to
              go General Setup page.
            </Text>

            <Text as="p" variant="bodyMd">
              <b>2. General Setup page : </b>
              On the General Setup page, select the shipping-free country,
              order-ready date, and Estimated delivery date, Then click the{" "}
              <b>Save</b>
              button .
              <p>
                Click the <b>View in store</b> button to manage the app in your
                store.
              </p>
            </Text>

            <Text as="p" variant="bodyMd">
              <b>3. Report page: </b>
              <p>
                The report page shows that the estimated delivery date is today,
                tomorrow, and the upcoming 7 days. Then there will be one{" "}
                <b>Edit</b>
                button to Edit the estimated delivery date, shipping-free
                country, and more.
              </p>
            </Text>
            <Text as="p" variant="bodyMd">
              <b>4. Theme editor setting </b>
              <p>
                Install the app, then set the end date and time for dispatch
                today.
              </p>
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
