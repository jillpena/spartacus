import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { OccStoreFinderService } from './store-finder.service';
import { OccModuleConfig } from '../occ-module-config';
import { SearchConfig } from '../../store-finder/models/search-config';
import { OccE2eConfigurationService } from '../e2e/e2e-configuration-service';

const queryText = 'test';
const searchResults = { stores: [{ name: 'test' }] };
const mockSearchConfig: SearchConfig = { pageSize: 5 };

const storeCountResponseBody = { CA: 50 };

const countryIsoCode = 'CA';
const regionIsoCode = 'CA-QC';

export class MockOccModuleConfig {
  server = {
    baseUrl: '',
    occPrefix: ''
  };
  site = {
    baseSite: '',
    language: '',
    currency: ''
  };
}

describe('OccStoreFinderService', () => {
  let service: OccStoreFinderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OccStoreFinderService,
        OccE2eConfigurationService,
        { provide: OccModuleConfig, useClass: MockOccModuleConfig }
      ]
    });

    service = TestBed.get(OccStoreFinderService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('query text search', () => {
    it('should return search results for given query text', () => {
      service
        .findStores(queryText, mockSearchConfig)
        .toPromise()
        .then(result => {
          expect(result).toEqual(searchResults);
        });

      const mockReq = httpMock.expectOne({
        method: 'GET',
        url:
          '/e2econfigurationwebservices/e2econfiguration/e2egoogleservices.storesdisplayed'
      });

      expect(mockReq.cancelled).toBeFalsy();
      expect(mockReq.request.responseType).toEqual('text');
    });
  });

  it('should request stores count', () => {
    service.storesCount().subscribe(result => {
      expect(result).toEqual(storeCountResponseBody);
    });

    httpMock
      .expectOne({ method: 'GET', url: '/stores/count' })
      .flush(storeCountResponseBody);
  });

  describe('query by country', () => {
    it('should request stores by country', () => {
      service.findStoresByCountry(countryIsoCode).subscribe(result => {
        expect(result).toEqual(searchResults);
      });
  
      httpMock
        .expectOne({ method: 'GET', url: '/stores/country/' + countryIsoCode })
        .flush(searchResults);
    });
  });

  describe('query by region', () => {
    it('should request stores by region', () => {
      service.findStoresByRegion(countryIsoCode, regionIsoCode).subscribe(result => {
        expect(result).toEqual(searchResults);
      });
  
      httpMock
        .expectOne({ method: 'GET', url: '/stores/country/' + countryIsoCode + '/region/' + regionIsoCode })
        .flush(searchResults);
    });
  });
});
