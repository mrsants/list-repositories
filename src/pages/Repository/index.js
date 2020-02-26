import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { FaSpinner } from "react-icons/fa";
import api from "../../services/api";

import Container from "../../components/Container";
import {
  Loading,
  Owner,
  IssueList,
  IssueOptions,
  IssueOption,
  LoadingIssues,
  Pagination,
  PaginationButton
} from "./styles";

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string
      })
    }).isRequired
  };

  state = {
    repository: {},
    issues: [],
    filters: [
      { name: "all", color: "#0366d6", label: "Todas" },
      { name: "open", color: "#28a745", label: "Abertas" },
      { name: "close", color: "#d73a4a", label: "Fechadas" }
    ],
    loading: true,
    loadingIssues: false,
    page: 1
  };

  async componentDidMount() {
    const { match } = this.props;
    const { page } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: "all",
          per_page: 5,
          page
        }
      })
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false
    });
  }

  handleIssueOption = async option => {
    this.setState({ loadingIssues: true });
    const { repository } = this.state;

    const response = await api.get(`/repos/${repository.full_name}/issues`, {
      params: {
        state: option,
        per_page: 5
      }
    });

    this.setState({ issues: response.data, loadingIssues: false });
  };

  handlePageUp = async () => {
    this.setState({ loadingIssues: true });

    const { page, repository } = this.state;

    const response = await api.get(`/repos/${repository.full_name}/issues`, {
      params: {
        state: "all",
        per_page: 5,
        page: page + 1
      }
    });

    this.setState({
      issues: response.data,
      page: page + 1,
      loadingIssues: false
    });
  };

  handlePageDown = async () => {
    this.setState({ loadingIssues: true });
    const { page, repository } = this.state;

    const response = await api.get(`/repos/${repository.full_name}/issues`, {
      params: {
        state: "all",
        per_page: 5,
        page: page - 1
      }
    });

    this.setState({
      issues: response.data,
      page: page - 1,
      loadingIssues: false
    });
  };

  render() {
    const { repository, issues, loading, loadingIssues, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueOptions>
          {this.state.filters.map(filter => (
            <IssueOption
              color={filter.color}
              onClick={() => this.handleIssueOption(filter.name)}
            >
              {filter.label}
            </IssueOption>
          ))}
        </IssueOptions>

        {loadingIssues ? (
          <LoadingIssues>
            <FaSpinner color="#7159c1" size={28} />
          </LoadingIssues>
        ) : (
          <IssueList>
            {issues.map(issue => (
              <li key={String(issue.id)}>
                <img src={issue.user.avatar_url} alt={issue.user.login} />
                <div>
                  <strong>
                    <a href={issue.html_url}>{issue.title}</a>
                    {issue.labels.map(label => (
                      <span key={String(label.id)}>{label.name}</span>
                    ))}
                  </strong>
                  <p>{issue.user.login}</p>
                </div>
              </li>
            ))}
          </IssueList>
        )}

        <Pagination>
          <PaginationButton onClick={this.handlePageDown} page={page}>
            Página anterior
          </PaginationButton>
          <PaginationButton onClick={this.handlePageUp}>
            Página seguinte
          </PaginationButton>
        </Pagination>
      </Container>
    );
  }
}
