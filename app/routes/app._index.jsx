import { useState, useEffect } from "react";
import { DiamondAlertMinor } from "@shopify/polaris-icons";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
  useNavigation,
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
  Badge,
  Thumbnail,
  useIndexResourceState,
  IndexFilters,
  useSetIndexFiltersMode,
  EmptySearchResult,
  Card,
  RadioButton,
  LegacyStack,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";

import {
  QUERY_NEXT_ORDERS,
  QUERY_PRODUCT,
  QUERY_PREVIOUS_ORDERS,
} from "utils/queries";

const PER_PAGE_PRODUCT_TO_SHOW = 10;

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  let products, error;

  try {
    products = await admin.graphql(QUERY_PRODUCT, {
      variables: {
        input: PER_PAGE_PRODUCT_TO_SHOW,
        query: "",
      },
    });
  } catch (err) {
    return json({
      products,
      error: "Something went wrong. Please try again !",
    });
  }

  return json({
    products: await products.json(),
    error,
  });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

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
    if (data.action === "next") {
      console.log("YES next it is ");
      // @ts-ignore
      products = await admin.graphql(QUERY_NEXT_ORDERS, {
        variables: {
          first: PER_PAGE_PRODUCT_TO_SHOW,
          after: data.after,
          ...variablesObj,
        },
      });
      console.log(products);
    } else if (data.action === "previous") {
      console.log("YES previous it is ");
      // @ts-ignore
      products = await admin.graphql(QUERY_PREVIOUS_ORDERS, {
        variables: {
          last: PER_PAGE_PRODUCT_TO_SHOW,
          before: data.before,
          ...variablesObj,
        },
      });
    } else if (data.action === "filter" || data.action === "sort") {
      // @ts-ignore
      products = await admin.graphql(QUERY_PRODUCT, {
        variables: {
          query: data.query,
          input: PER_PAGE_PRODUCT_TO_SHOW,
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
  products = await products.json();
  console.log("products == " + products);
  return json({
    products,
    error,
  });
};

export default function Index() {
  const navigate = useNavigate();
  const submit = useSubmit();
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

  const renderOrdersTable = () => {
    return (
      <>
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
                  Details
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
                            `/app/order/${
                              // @ts-ignore
                              product?.legacyResourceId
                            }`
                          );
                        }}
                      >
                        Status
                      </Button>
                      {/* </HorizontalStack> */}
                    </IndexTable.Cell>
                  </IndexTable.Row>
                )
              )
            : renderEmptyTable()}
        </IndexTable>
      </>
    );
  };

  const renderOrdersEmptyState = () => {
    return (
      <EmptyState
        heading="No products is placed in this store."
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

          {renderOrdersTable()}

          <br />

          {edges.length && (
            <div
              style={{
                display: "flex",
                alignContent: "center",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              {" "}
              <Form>
                <Pagination
                  label="Products"
                  // @ts-ignore
                  hasPrevious={pageInfo?.hasPreviousPage}
                  onPrevious={() => {
                    setTableLoading(true);
                    submit(
                      // @ts-ignore
                      {
                        action: "previous",
                        // @ts-ignore
                        before: pageInfo?.startCursor,
                        query: queryValue,
                      },
                      { method: "POST" }
                    );
                  }}
                  // @ts-ignore
                  hasNext={pageInfo?.hasNextPage}
                  onNext={() => {
                    setTableLoading(true);
                    submit(
                      // @ts-ignore
                      {
                        action: "next",
                        // @ts-ignore
                        after: pageInfo?.endCursor,
                        query: queryValue,
                      },
                      { method: "POST" }
                    );
                  }}
                />
              </Form>
            </div>
          )}
        </Page>
      ) : (
        renderOrdersEmptyState()
      )}
    </>
  );
}
