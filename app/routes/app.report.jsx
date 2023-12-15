import { useState, useEffect } from "react";
import { DiamondAlertMinor } from "@shopify/polaris-icons";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
  useNavigation,
  Scrollable,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import {
  Page,
  Text,
  IndexTable,
  EmptyState,
  Pagination,
  Button,
  Spinner,
  Select,
  Thumbnail,
  useIndexResourceState,
  IndexFilters,
  useSetIndexFiltersMode,
  EmptySearchResult,
  Card,
  Banner,
  PageActions,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";

import {
  QUERY_NEXT_ORDERS,
  QUERY_PRODUCT,
  QUERY_PREVIOUS_ORDERS,
} from "utils/queries";
import prisma from "../db.server";

const PER_PAGE_PRODUCT_TO_SHOW = 2;

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const shopData = await admin.rest.resources.Shop.all({ session: session });
  const shopID = String(shopData.data[0].id);
  const Today = new Date();
  Today.setUTCHours(0, 0, 0, 0);

  const getAllProduct = await prisma.productreport.findMany({
    where: {
      deliveryTime: {
        gte: Today,
        lt: new Date(Today.getTime() + 24 * 60 * 60 * 1000),
      },
      shopId: shopID,
    },
  });

  console.log(getAllProduct);
  const productIdsFromDatabase = getAllProduct.map(
    (product) => product.productId
  );
  console.log(productIdsFromDatabase);

  let products, error;

  const productsResponse = await admin.rest.resources.Product.all({
    session: session,
  });

  const allProduct = Array.isArray(productsResponse.data)
    ? productsResponse.data
    : [];

  console.log(allProduct.length);
  let LENGHT_OF_ALL_PRODUCT = allProduct.length;

  try {
    products = await admin.graphql(QUERY_PRODUCT, {
      variables: {
        input: LENGHT_OF_ALL_PRODUCT,
        query: "",
      },
    });
  } catch (err) {
    return json({
      products,
      error: "Something went wrong. Please try again !",
    });
  }
  const productsData = await products.json();
  console.log(productsData);

  //   const filteredProducts = productsData?.data?.products?.edges?.filter((edge) =>
  //     productIdsFromDatabase.includes(edge?.node?.legacyResourceId)
  //   );
  //   console.log(filteredProducts);
  const filteredProducts = productsData?.data?.products?.edges?.filter((edge) =>
    productIdsFromDatabase.includes(edge?.node?.legacyResourceId)
  );
  console.log(filteredProducts);

  const finalOutput = {
    data: {
      products: {
        edges: filteredProducts || [],
        pageInfo: productsData?.data?.products?.pageInfo,
      },
    },
    extensions: productsData?.extensions,
  };

  console.log(finalOutput);

  return json({
    products: finalOutput,
    error,
  });
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const productsResponse = await admin.rest.resources.Product.all({
    session: session,
  });

  const allProduct = Array.isArray(productsResponse.data)
    ? productsResponse.data
    : [];

  console.log(allProduct.length);
  let LENGHT_OF_ALL_PRODUCT = allProduct.length;

  const data = {
    ...Object.fromEntries(await request.formData()),
  };

  console.log(data);
  let products = [];
  let error;

  // @ts-ignore

  const variablesObj = {
    query: data.query,
  };

  try {
    if (data.action === "date") {
      console.log("okok");
      products = await admin.graphql(QUERY_PRODUCT, {
        variables: {
          query: "",
          input: LENGHT_OF_ALL_PRODUCT,
        },
      });
    } else if (data.action === "filter" || data.action === "sort") {
      // @ts-ignore
      products = await admin.graphql(QUERY_PRODUCT, {
        variables: {
          query: data.query,
          input: LENGHT_OF_ALL_PRODUCT,
        },
      });
    }
  } catch (error) {
    console.log(error);
    return json({
      products: [],
      error: "Something went wrong. Please try again !",
    });
  }

  // @ts-ignore
  //   products = await products.json();
  const shopData = await admin.rest.resources.Shop.all({ session: session });
  const shopID = String(shopData.data[0].id);
  const Today = new Date();
  Today.setUTCHours(0, 0, 0, 0);

  const Tomorrow = new Date(Today);
  Tomorrow.setDate(Today.getDate() + 1);
  Tomorrow.setUTCHours(0, 0, 0, 0);

  const UpcomingWeek = new Date(Today);
  UpcomingWeek.setDate(Today.getDate() + 7);
  UpcomingWeek.setUTCHours(0, 0, 0, 0);

  let getAllProduct;
  if (data.value === "tomorrow") {
    console.log("tomorrow");
    getAllProduct = await prisma.productreport.findMany({
      where: {
        deliveryTime: {
          gte: Tomorrow,
          lt: new Date(Tomorrow.getTime() + 24 * 60 * 60 * 1000),
        },
        shopId: shopID,
      },
    });
  } else if (data.value === "upcomingWeek") {
    console.log("upcomming");
    getAllProduct = await prisma.productreport.findMany({
      where: {
        deliveryTime: {
          gte: Today,
          lt: new Date(UpcomingWeek.getTime() + 24 * 60 * 60 * 1000),
        },
        shopId: shopID,
      },
    });
  } else {
    getAllProduct = await prisma.productreport.findMany({
      where: {
        deliveryTime: {
          gte: Today,
          lt: new Date(Today.getTime() + 24 * 60 * 60 * 1000),
        },
        shopId: shopID,
      },
    });
  }

  console.log(getAllProduct);

  const productIdsFromDatabase = getAllProduct?.map(
    (product) => product.productId
  );

  const productsData = await products.json();
  console.log(productsData);
  const filteredProducts = productsData?.data?.products?.edges?.filter((edge) =>
    productIdsFromDatabase?.includes(edge?.node?.legacyResourceId)
  );
  console.log(filteredProducts);

  const finalOutput = {
    data: {
      products: {
        edges: filteredProducts || [],
        pageInfo: productsData?.data?.products?.pageInfo,
      },
    },
    extensions: productsData?.extensions,
  };

  console.log(finalOutput);

  console.log("products == " + products);
  return json({
    products: finalOutput,
    error,
  });
};

export default function Dashboard() {
  const navigate = useNavigate();
  const nav = useNavigation();

  const [edges, setEdges] = useState([]);
  const [pageInfo, setPageInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");
  const [queryValue, setQueryValue] = useState("");
  const [perPage, setPerpage] = useState(0);
  const [sheet, setSheet] = useState(false);

  const { mode, setMode } = useSetIndexFiltersMode();
  const [banner, setBanner] = useState(true);
  const submit = useSubmit();
  const [selectedDay, setSelectedDay] = useState("today");
  const handleSelectChange = (value) => {
    // setQueryValue("");
    setSelectedDay(value);
    submit(
      {
        value,
        action: "date",
        query: "",
      },
      {
        method: "POST",
      }
    );
  };

  //   useCallback((value) => setSelectedDay(value), []);

  const handelBanner = () => {
    setBanner(false);
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const options = [
    { label: "Today", value: "today" },
    { label: "Tomorrow", value: "tomorrow" },
    { label: "Upcoming 7 days", value: "upcomingWeek" },
  ];
  const sortOptions = [
    { label: "Today", value: "today" },
    { label: "Tomorrow", value: "tomorrow" },
    { label: "Upcoming 7 days", value: "upcomingWeek" },
  ];

  let selectedDate;

  if (selectedDay === "tomorrow") {
    selectedDate = new Date(currentDate);

    selectedDate.setDate(currentDate.getDate() + 1);
  } else if (selectedDay === "upcomingWeek") {
    selectedDate = new Date(currentDate);

    selectedDate.setDate(currentDate.getDate() + 7);
  } else {
    selectedDate = currentDate;
  }

  const formattedSelectedDate = selectedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const loaderData = useLoaderData();
  console.log("loaderData" + JSON.stringify(loaderData.products));
  const actionData = useActionData();
  console.log(JSON.stringify(actionData?.products));

  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  const resourceName = {
    singular: "product",
    plural: "products",
  };
  const [value, setValue] = useState(0);
  const handleChange = (newValue) => {
    setValue(newValue);
  };

  const filters = [];
  const tabs = [];

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(edges);

  const handleFiltersQueryChange = (value) => {
    setQueryValue(value);
    setTableLoading(true);
    submit(
      {
        action: "filter",
        query: value,
        // @ts-ignore
        after: pageInfo?.endCursor,
      },
      {
        method: "POST",
      }
    );

    if (value === "") {
      setLoading(true);
    }
  };

  useEffect(() => {
    setEdges(
      actionData?.products?.data?.products?.edges
        ? actionData?.products?.data?.products?.edges?.map((edge) => ({
            ...edge,
            id: edge?.node?.legacyResourceId,
          }))
        : loaderData?.products?.data?.products?.edges?.map((edge) => ({
            ...edge,
            id: edge?.node?.legacyResourceId,
          }))
    );

    // setEdges([]);

    setPageInfo(
      actionData?.products?.data?.products?.pageInfo
        ? actionData?.products?.data?.products?.pageInfo
        : loaderData?.products?.data?.products?.pageInfo
    );

    setError(actionData?.error ? actionData?.error : loaderData?.error);

    setLoading(false);
    setTableLoading(false);
  }, [
    loaderData?.products?.data?.products?.edges,
    loaderData?.products?.data?.products?.pageInfo,
    actionData?.products?.data?.products?.edges,
    actionData?.products?.data?.products?.pageInfo,
    actionData?.error,
    loaderData?.error,
  ]);

  const renderTableCell = (value) => {
    return (
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">
          {value}
        </Text>
      </IndexTable.Cell>
    );
  };
  const FINANCIAL_STATUS = {
    AUTHORIZED: "info",
    EXPIRED: "critical",
    PAID: "success",
    PARTIALLY_PAID: "info",
    PARTIALLY_REFUNDED: "info",
    PENDING: "attention",
    REFUNDED: "info",
    VOIDED: "info",
  };

  const STATUS = {
    FULFILLED: "success",
    IN_PROGRESS: "attention",
    ON_HOLD: "attention",
    OPEN: "info",
    PARTIALLY_FULFILLED: "info",
    PENDING_FULFILLMENT: "info",
    RESTOCKED: "critical",
    SCHEDULED: "attention",
    UNFULFILLED: "warning",
  };

  const getBadgeColor = (order) => {
    // const financialStatus = order?.displayFinancialStatus;
    // console.log(order);
    return FINANCIAL_STATUS[order];
  };
  const getBadgeColorFulfillment = (order) => {
    // const financialStatus = order?.displayFinancialStatus;
    // console.log(order);
    return STATUS[order];
  };

  const [sortSelected, setSortSelected] = useState(["order asc"]);

  const renderOrdersTable = () => {
    return (
      <>
        <div style={{ height: "300px", overflow: "auto" }}>
          <IndexFilters
            mode={mode}
            setMode={setMode}
            queryValue={queryValue}
            queryPlaceholder="Searching in all"
            filters={filters}
            onQueryChange={handleFiltersQueryChange}
            onQueryClear={() => {
              handleFiltersQueryChange("");
              setQueryValue("");
              setSelectedDay("today");
            }}
            // @ts-ignore

            tabs={tabs}
            onClearAll={() => {}}
            cancelAction={{
              onAction: () => {},
              disabled: false,
              loading: false,
            }}
            loading={tableLoading}
          />
          {/* <IndexFilters
            sortOptions={sortOptions}
            sortSelected={sortSelected}
            queryValue={queryValue}
            queryPlaceholder="Searching in all"
            onQueryChange={handleFiltersQueryChange}
            onQueryClear={() => setQueryValue("")}
            onSort={setSortSelected}
            primaryAction={primaryAction}
            cancelAction={{
              onAction: onHandleCancel,
              disabled: false,
              loading: false,
            }}
            tabs={tabs}
            selected={selected}
            onSelect={setSelected}
            canCreateNewView
            onCreateNewView={onCreateNewView}
            filters={filters}
            appliedFilters={appliedFilters}
            onClearAll={handleFiltersClearAll}
            mode={mode}
            setMode={setMode}
          /> */}

          <IndexTable
            headings={[
              {
                title: (
                  <span style={{ fontWeight: "bold", fontSize: "13px" }}></span>
                ),
              },
              {
                title: (
                  <span style={{ fontWeight: "bold", fontSize: "13px" }}>
                    Product
                  </span>
                ),
              },
              {
                title: (
                  <span style={{ fontWeight: "bold", fontSize: "13px" }}>
                    Status
                  </span>
                ),
              },
              {
                title: (
                  <span style={{ fontWeight: "bold", fontSize: "13px" }}>
                    Inventory
                  </span>
                ),
              },
              {
                title: (
                  <span style={{ fontWeight: "bold", fontSize: "13px" }}>
                    Vendor
                  </span>
                ),
              },

              {
                title: (
                  <span style={{ fontWeight: "bold", fontSize: "13px" }}>
                    Edit
                  </span>
                ),
              },
            ]}
            itemCount={edges?.length}
            resourceName={resourceName}
            selectable={false}
            selectedItemsCount={
              allResourcesSelected ? "All" : selectedResources?.length
            }
            onSelectionChange={handleSelectionChange}
          >
            {edges?.length
              ? edges.map(
                  (
                    {
                      // @ts-ignore
                      node: product,
                    },
                    index
                  ) => (
                    <IndexTable.Row
                      key={index}
                      id={
                        // @ts-ignore
                        product?.legacyResourceId
                      }
                      position={index}
                      // @ts-ignore
                      selected={selectedResources?.includes(
                        // @ts-ignore
                        product?.legacyResourceId
                      )}
                    >
                      {/* {renderTableCell(
                      // @ts-ignore
                     
                    { 
                      product?.featuredImage &&(
                        <Thumbnail
                      source={p.image.src}
                      alt={p.image.alt}
                      size="large"
                    />
                      )

                    }
                    )} */}
                      {renderTableCell(
                        <div>
                          {product?.featuredImage && (
                            <Thumbnail
                              source={product.featuredImage.url}
                              alt={product.title}
                              size="small"
                            />
                          )}
                        </div>
                      )}

                      {renderTableCell(
                        // @ts-ignore
                        product?.title
                      )}

                      {renderTableCell(
                        // @ts-ignore
                        product?.status
                      )}

                      {renderTableCell(
                        // @ts-ignore
                        `${product?.totalInventory}  in stock`
                      )}

                      {renderTableCell(
                        // @ts-ignore
                        product?.vendor
                      )}

                      {/* {renderTableCell(
                      // @ts-ignore

                      // <Badge
                      // // @ts-ignore
                      // >
                      //   {
                      //     // @ts-ignore
                      //     order?.displayFinancialStatus
                      //   }
                      // </Badge>
                      <Badge
                        tone={getBadgeColor(order?.displayFinancialStatus)}
                      >
                        {order?.displayFinancialStatus}
                      </Badge>
                    )} */}

                      {/* {renderTableCell(
                      // @ts-ignore
                      <Badge
                        tone={getBadgeColorFulfillment(
                          order?.displayFulfillmentStatus
                        )}
                      >
                        {order?.displayFulfillmentStatus}
                      </Badge>
                    )} */}

                      <IndexTable.Cell>
                        {/* <HorizontalStack align="end"> */}
                        <Button
                          textAlign="end"
                          primary
                          variant="primary"
                          tone="success"
                          onClick={() => {
                            setLoading(true);

                            navigate(
                              `/app/product/${
                                // @ts-ignore
                                product?.legacyResourceId
                              }`
                            );
                          }}
                        >
                          Edit
                        </Button>
                        {/* </HorizontalStack> */}
                      </IndexTable.Cell>
                    </IndexTable.Row>
                  )
                )
              : renderEmptyTable()}
          </IndexTable>
        </div>
      </>
    );
  };

  const renderOrdersEmptyState = () => {
    return (
      <EmptyState
        heading="No products order is placed in this day."
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      ></EmptyState>
    );
  };

  const renderEmptyTable = () => {
    return (
      <EmptySearchResult
        title={"No products with the applied filters"}
        description={" Changing the search term and try again"}
        withIllustration
      />
    );
  };

  return (
    <>
      <Page>
        <PageActions
          primaryAction={
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
          }
        />
        {banner && (
          <Banner
            title={`Product that has delivery upto ${formattedSelectedDate}`}
            tone="warning"
            //   onDismiss={handelBanner}
          >
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {" "}
              <p>Show the product that the delivery date is close to : </p>
              <Select
                label=""
                options={options}
                onChange={(value) => handleSelectChange(value)}
                value={selectedDay}
              />
            </div>

            <div
              style={{
                display: "flex",

                width: "50%",

                textAlign: "end",

                alignItems: "end",

                justifyContent: "end",
              }}
            >
              {/* <Select
              label="Date range"
              options={options}
              onChange={(value) => handleSelectChange(value)}
              value={selectedDay}
            /> */}
            </div>
          </Banner>
        )}{" "}
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "absulate",
              top: "50%",
              color: "red",
            }}
          >
            <Spinner size="large" accessibilityLabel="Loading" />
          </div>
        ) : error ? (
          <Page style={{ padding: "10px", backgroundColor: "#db1111" }}>
            <Card style={{ padding: "10px", backgroundColor: "#db1111" }}>
              {/* Something went wrong */}
              <Spinner accessibilityLabel="Spinner example" size="large" />;
            </Card>
          </Page>
        ) : edges?.length || queryValue ? (
          <Page fullWidth={true}>
            <div
              style={{
                display: "flex",
                alignContent: "center",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              {/* <Card>Products data</Card> */}
            </div>
            <br />
            <div style={{ height: "300px", overflow: "auto" }}>
              {renderOrdersTable()}
            </div>

            <br />
          </Page>
        ) : (
          renderOrdersEmptyState()
        )}
      </Page>
    </>
  );
}
