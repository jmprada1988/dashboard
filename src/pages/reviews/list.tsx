import {
    BaseKey,
    IResourceComponentsProps,
    useNavigation,
    useTranslate,
    useUpdateMany,
} from "@refinedev/core";
import React from "react";

import Check from "@mui/icons-material/Check";
import Clear from "@mui/icons-material/Clear";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { List, useDataGrid } from "@refinedev/mui";

import { IReview } from "interfaces";

export const ReviewsList: React.FC<IResourceComponentsProps> = () => {
    const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>(
        [],
    );
    const hasSelected = selectedRowKeys.length > 0;

    const t = useTranslate();
    const { show } = useNavigation();

    const { mutate } = useUpdateMany<IReview>();

    const { dataGridProps } = useDataGrid<IReview>({
        initialPageSize: 10,
        permanentFilter: [
            {
                field: "status",
                operator: "eq",
                value: "pending",
            },
        ],
    });

    const handleUpdate = (id: BaseKey, status: IReview["status"]) => {
        mutate({
            resource: "reviews",
            ids: [id],
            values: { status },
            mutationMode: "undoable",
        });
    };

    const updateSelectedItems = (status: "approved" | "rejected") => {
        mutate(
            {
                resource: "reviews",
                ids: selectedRowKeys.map(String),
                values: {
                    status,
                },
                mutationMode: "undoable",
            },
            {
                onSuccess: () => {
                    setSelectedRowKeys([]);
                },
            },
        );
    };

    const columns = React.useMemo<GridColDef<IReview>[]>(
        () => [
            {
                field: "user",
                headerName: t("reviews.fields.user"),
                valueGetter: ({ row }) => row.owner_id,
                minWidth: 200,
                flex: 1,
                sortable: false,
            },
            {
                field: "comment",
                headerName: t("reviews.fields.review"),
                renderCell: function render({ row }) {
                    return (
                        <Tooltip title={row.id}>
                            <Typography
                                variant="body2"
                                sx={{
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                }}
                            >
                                {row.comment}
                            </Typography>
                        </Tooltip>
                    );
                },
                minWidth: 200,
                flex: 1,
            },

            {
                field: "star",
                headerName: t("reviews.fields.rating"),
                headerAlign: "center",
                flex: 1,
                minWidth: 250,
                align: "center",
                renderCell: function render({ row }) {
                    return (
                        <Stack
                            alignItems="center"
                            sx={{ whiteSpace: "break-spaces" }}
                        >
                            <Typography variant="h5">{row.rating}</Typography>
                            <Rating
                                name="rating"
                                defaultValue={row.rating}
                                readOnly
                            />
                        </Stack>
                    );
                },
            },
          {
            field: "status",
            headerName: t("reviews.fields.status"),
            headerAlign: "center",
            flex: 1,
            minWidth: 20,
            align: "center",
            renderCell: function render({ row }) {
              return (
                <Tooltip title={row.id}>
                  <Typography
                    variant="body2"
                    sx={{
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {row.status}
                  </Typography>
                </Tooltip>
              );
            },
          },
            {
                field: "actions",
                headerName: t("table.actions"),
                type: "actions",
                getActions: ({ row }) => [
                    <GridActionsCellItem
                        key={1}
                        label={t("buttons.accept")}
                        icon={<Check color="success" />}
                        onClick={() => handleUpdate(row.id, "approved")}
                        showInMenu
                    />,
                    <GridActionsCellItem
                        key={2}
                        label={t("buttons.reject")}
                        icon={<Clear color="error" />}
                        onClick={() => handleUpdate(row.id, "rejected")}
                        showInMenu
                    />,
                ],
            },
        ],
        [t],
    );

    return (
        <List
            wrapperProps={{ sx: { paddingX: { xs: 2, md: 0 } } }}
            headerProps={{
                subheader: hasSelected && (
                    <Stack direction="row">
                        <Button
                            startIcon={<Check color="success" />}
                            onClick={() => updateSelectedItems("approved")}
                        >
                            {t("buttons.acceptAll")}
                        </Button>
                        <Button
                            startIcon={<Clear color="error" />}
                            onClick={() => updateSelectedItems("rejected")}
                        >
                            {t("buttons.rejectAll")}
                        </Button>
                    </Stack>
                ),
            }}
        >
            <DataGrid
                {...dataGridProps}
                columns={columns}
                autoHeight
                checkboxSelection
                density="comfortable"
                onRowSelectionModelChange={(newSelectionModel) => {
                    setSelectedRowKeys(newSelectionModel as React.Key[]);
                }}
                pageSizeOptions={[10, 20, 50, 100]}
                rowSelectionModel={selectedRowKeys}
            />
        </List>
    );
};
