import React from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";
import { IGetRowsParams } from "ag-grid-community";
import { client } from "./App";
import gql from "graphql-tag";

export const Movie: React.FC = () => {
  const columnDefs = [
    {
      field: "id"
    },
    {
      field: "title"
    },
    {
      field: "year"
    },
    {
      field: "cast"
    },
    {
      field: "genres"
    }
  ];
  const datasource = {
    async getRows(param: IGetRowsParams) {
      console.log(`GRID-GET-MOVIE-ROWS`, { param });
      try {
        const variables = {
          skip: param.startRow,
          limit: param.startRow - param.endRow,
          orderBy: []
        };
        // if (param.sortModel && param.sortModel.length > 0) {
        //   const col = this.gridOptions.columnApi.getColumn(
        //     param.sortModel[0].colId
        //   );
        //   variables.orderBy = {
        //     field: col.colDef.field,
        //     type: param.sortModel[0].sort
        //   };
        // }
        const res = (await client.query({
          query: gql`
          query movies($skip: Int, $limit: Int, $orderBy: [OrderByMovieInput!]) {
            me(ts: "${Math.floor(Date.now() / 1000)}") {
              time
              name
              privileges
              token {
                seq
                token
              }
            }
            movies(skip: $skip, limit: $limit, orderBy: $orderBy) {
              total
              items {
                id
                title
                year
                cast
                genres
              }
            }
          }
        `,
          variables
        })).data;
        console.log(`GRID-GET-MOVIE-ROWS-RESULT`, { res });
        param.successCallback(res.movies.items, res.movies.total);
      } catch (err) {
        console.log(err);
        param.failCallback();
        // } finally {
        // this.loading = false;
      }
    }
  };
  return (
    <div
      className="ag-theme-balham"
      style={{
        height: "calc(100vh - 64px)",
        width: "100%"
      }}
    >
      <AgGridReact
        rowModelType="infinite"
        rowSelection="single"
        columnDefs={columnDefs}
        datasource={datasource}
      ></AgGridReact>
    </div>
  );
};
