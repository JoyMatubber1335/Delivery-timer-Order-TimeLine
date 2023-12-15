import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  Banner,
  Thumbnail,
  Select,
  BlockStack,
  Divider,
  TextField,
  Popover,
  Icon,
  DatePicker,
  Button,
  PageActions,
  Spinner,
} from "@shopify/polaris";
import { CalendarMajor } from "@shopify/polaris-icons";
import { authenticate } from "~/shopify.server";
import { useEffect, useState, useCallback, useRef } from "react";
import { json } from "@remix-run/node";
import prisma from "../db.server";
import {
  useLoaderData,
  useNavigate,
  useSubmit,
  useNavigation,
} from "@remix-run/react";

// export const loader = async ({ request, params }) => {
//   const { admin, session } = await authenticate.admin(request);

//   const shopData = await admin.rest.resources.Shop.all({ session: session });

//   const ID = params.id;
//   console.log(ID);

//   const product = await admin.rest.resources.Product.find({
//     session: session,
//     id: ID,
//   });
//   console.log(product);

//   const response = await fetch("https://restcountries.com/v3.1/all");
//   console.log(response);
//   return json({
//     product,
//   });
// };

export const loader = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);

  const shopData = await admin.rest.resources.Shop.all({ session: session });

  const ID = params.id;
  console.log(ID);

  const product = await admin.rest.resources.Product.find({
    session: session,
    id: ID,
  });
  console.log(product);

  const response = await fetch("https://restcountries.com/v3.1/all");

  const countries = await response.json();

  const allMetafiledProduct = await admin.rest.resources.Metafield.all({
    session: session,
    product_id: parseInt(ID),
  });

  const productSetupMetafield = allMetafiledProduct.data.find(
    (metafield) =>
      metafield.namespace === "productSetting" &&
      metafield.key === "productSettingSet"
  );
  let productMetafiledValue = null;
  if (productSetupMetafield) {
    console.log(productSetupMetafield.value);
    productMetafiledValue = productSetupMetafield.value;
  }
  // console.log(productMetafiledValue?);

  console.log(countries);
  return json({
    product,
    countries,
    productMetafiledValue,
  });
};
export const action = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = Object.fromEntries(await request.formData());

  const shopDetails = await admin.rest.resources.Shop.all({
    session: session,
  });

  const shopID = String(shopDetails.data[0].id);
  // if (shopID) {
  //   const create = await prisma.productreport.create({
  //     data: {
  //       productId: String(formData.productId),
  //       shopId: shopID,
  //       deliveryTime: new Date(formData.deliveryDate),
  //     },
  //   });
  //   console.log(create);
  // }
  console.log(formData.deliveryDate);

  if (shopID) {
    const productID = String(formData.productId);
    const deliveryTime = new Date(`${formData.deliveryDate} UTC`);
    console.log(deliveryTime);
    // const deliveryTime = new Date(`${formData.deliveryDate} UTC`);

    const existingProductReport = await prisma.productreport.findFirst({
      where: { productId: productID, shopId: shopID },
    });
    console.log(existingProductReport);

    if (existingProductReport) {
      const update = await prisma.productreport.update({
        where: { productId: productID },
        data: {
          shopId: shopID,
          deliveryTime: deliveryTime,
        },
      });
      console.log(update);
    } else {
      const create = await prisma.productreport.create({
        data: {
          productId: productID,
          shopId: shopID,
          deliveryTime: deliveryTime,
        },
      });
      console.log(create);
    }
  }

  let orderStatusValue = null;
  let deliveryDateValue = null;
  console.log(formData.selectedCountry);
  console.log(formData.deliveryDate);
  console.log(formData.orderReadyDate);
  console.log(formData.productId);

  const settingData = {
    selectedCountry: formData.selectedCountry,
    deliveryDate: formData.deliveryDate,
    orderReadyDate: formData.orderReadyDate,
  };

  if (formData.productId) {
    const productMetafield = new admin.rest.resources.Metafield({
      session: session,
    });
    productMetafield.product_id = formData.productId;
    productMetafield.namespace = "productSetting";
    productMetafield.key = "productSettingSet";
    productMetafield.value = JSON.stringify(settingData);
    productMetafield.type = "json";

    await productMetafield.save({
      update: true,
    });
    const parsedValue = JSON.parse(productMetafield.value);

    console.log(parsedValue.deliveryDate);
  }

  return null;
};

export default function AdditionalPage() {
  const submit = useSubmit();

  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const navigate = useNavigate();

  const loaderData = useLoaderData();
  console.log(loaderData);
  console.log(loaderData.product.id);
  console.log(loaderData.productMetafiledValue);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const deliveryDatePick = JSON.parse(loaderData.productMetafiledValue);
  console.log(deliveryDatePick?.deliveryDate);

  const handleDismiss = () => {
    setIsBannerDismissed(true);
  };
  const [visible, setVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [{ month, year }, setDate] = useState({
    month: selectedDate.getMonth(),
    year: selectedDate.getFullYear(),
  });
  const formattedValue = selectedDate.toLocaleDateString().slice(0, 10);
  const datePickerRef = useRef(null);
  function isNodeWithinPopover(node) {
    return datePickerRef?.current
      ? nodeContainsDescendant(datePickerRef.current, node)
      : false;
  }
  function handleInputValueChange() {
    console.log("handleInputValueChange");
  }
  function handleOnClose({ relatedTarget }) {
    setVisible(false);
  }
  function handleMonthChange(month, year) {
    setDate({ month, year });
  }

  function handleMonthChangeReadyStart(month, year) {
    setDate({ month, year });
  }
  function handleMonthChangeReadyEnd(month, year) {
    setDate({ month, year });
  }
  function handleDateSelection({ end: newSelectedDate }) {
    setSelectedDate(newSelectedDate);
    setVisible(false);
  }

  useEffect(() => {
    if (selectedDate) {
      setDate({
        month: selectedDate.getMonth(),
        year: selectedDate.getFullYear(),
      });
    }
  }, [selectedDate]);

  function nodeContainsDescendant(rootNode, descendant) {
    if (rootNode === descendant) {
      return true;
    }
    let parent = descendant.parentNode;
    while (parent != null) {
      if (parent === rootNode) {
        return true;
      }
      parent = parent.parentNode;
    }
    return false;
  }

  const [countries, setCountries] = useState([]);
  const currentDate = new Date();

  const [selectedDates, setSelectedDates] = useState({
    start: new Date(),
    end: new Date(),
  });
  const handleMonthChangeDelivery = useCallback(
    (month, year) => setDate({ month, year }),
    []
  );

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const deliveryDate = formatDate(selectedDates.start);
  const orderReadyDate = formatDate(selectedDate);
  const productId = loaderData.product.id;
  const handelSave = () => {
    submit(
      {
        selectedCountry,
        deliveryDate,
        orderReadyDate,
        productId,
      },
      { method: "POST" }
    );
  };
  const nav = useNavigation();

  useEffect(() => {
    const parsedValue = JSON.parse(loaderData.productMetafiledValue);
    setSelectedCountry(parsedValue ? parsedValue.selectedCountry : null);
  }, [loaderData]);

  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  return (
    <Page>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <Button
          primary
          tone="success"
          variant="primary"
          onClick={() => {
            navigate("/app/report");
          }}
        >
          Report
        </Button>

        <Button
          primary
          tone="success"
          variant="primary"
          onClick={() => {
            navigate("/app");
          }}
        >
          Home
        </Button>
      </div>

      <ui-title-bar title="General Setup page" />
      <Layout>
        <Layout.Section>
          {!isBannerDismissed && (
            <Banner title="Product delivery" onDismiss={handleDismiss}>
              <p>
                This product was delivered on{" "}
                {isLoading ? (
                  <Spinner accessibilityLabel="Spinner example" size="small" />
                ) : (
                  <b>
                    {loaderData?.productMetafiledValue
                      ? JSON.parse(loaderData.productMetafiledValue)
                          .deliveryDate
                      : "Not set yet"}
                  </b>
                )}
              </p>
            </Banner>
          )}
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="250">
              <div
                style={{
                  marginBottom: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <Text as="h2" variant="headingMd">
                  Product settings
                </Text>
                <Text as="h5" variant="bodySm" fontWeight="regular">
                  Select free shipping country / Estimated delivery date / Order
                  Ready date
                </Text>{" "}
              </div>
              <Divider borderColor="border-inverse" borderWidth="0165" />
              <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <Text as="h2" variant="headingMd">
                    Selecte the shipping free country :
                  </Text>
                  <Select
                    value={selectedCountry}
                    onChange={(value) => setSelectedCountry(value)}
                    options={[
                      { label: "Choose a country", value: "", disabled: true },
                      ...(loaderData?.countries || []).map((country) => ({
                        label: country.name.common,
                        value: country.name.common,
                      })),
                    ]}
                  />
                </div>
              </div>{" "}
              <Divider borderColor="border" borderWidth="0165" />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <Text as="h2" variant="headingMd">
                  Product ready date :
                </Text>
                <BlockStack inlineAlign="center" gap="400">
                  <Box minWidth="276px" padding={{ xs: 200 }}>
                    <Popover
                      active={visible}
                      autofocusTarget="none"
                      preferredAlignment="left"
                      fullWidth
                      preferInputActivator={false}
                      preferredPosition="below"
                      preventCloseOnChildOverlayClick
                      onClose={handleOnClose}
                      activator={
                        <TextField
                          role="combobox"
                          label={"Product Ready for"}
                          prefix={<Icon source={CalendarMajor} />}
                          value={formattedValue}
                          onFocus={() => setVisible(true)}
                          onChange={handleInputValueChange}
                          autoComplete="off"
                        />
                      }
                    >
                      <Card ref={datePickerRef}>
                        <DatePicker
                          month={month}
                          year={year}
                          selected={selectedDate}
                          onMonthChange={handleMonthChange}
                          onChange={handleDateSelection}
                        />
                      </Card>
                    </Popover>
                  </Box>
                </BlockStack>
                {/* <p>date :{selectedDate.toLocaleDateString()}</p> */}
              </div>
              <Divider borderColor="border" borderWidth="0165" />
              <div style={{ marginTop: "3rem" }}>
                <Text as="h2" variant="headingMd">
                  Estimated delivery date :
                </Text>
                <DatePicker
                  month={month}
                  year={year}
                  onChange={setSelectedDates}
                  onMonthChange={handleMonthChangeDelivery}
                  selected={selectedDates}
                />
              </div>
              <div style={{ marginTop: "1rem" }}>
                <Button
                  primary
                  tone="success"
                  variant="primary"
                  onClick={handelSave}
                >
                  Save
                </Button>
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Product information
              </Text>
              <Divider borderColor="border-inverse" borderWidth="0165" />
            </BlockStack>
            <BlockStack gap="300">
              {loaderData && loaderData?.product && (
                <div
                  style={{
                    alignItems: "center",
                    marginTop: "2rem",
                  }}
                >
                  <Layout>
                    <Card>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginTop: "1rem",
                        }}
                      >
                        {loaderData?.product?.image && (
                          <Thumbnail
                            source={loaderData?.product?.image.src}
                            alt={loaderData?.product?.image.alt}
                            size="large"
                          />
                        )}
                        <div style={{ marginLeft: "20px", flex: "1" }}>
                          {/* <h1>{loaderData?.product?.title}</h1> */}
                          <Text as="h2" variant="headingMd">
                            {loaderData?.product?.title}
                          </Text>
                          <h2>$ {loaderData?.product?.variants[0].price}</h2>
                        </div>
                      </div>
                    </Card>
                  </Layout>
                </div>
              )}
            </BlockStack>
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
      paddingInlineStart="100"
      paddingInlineEnd="100"
      background="bg-surface-active"
      borderWidth="025"
      borderColor="border"
      borderRadius="100"
    >
      <code>{children}</code>
    </Box>
  );
}
