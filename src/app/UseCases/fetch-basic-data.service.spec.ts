import { TestBed } from '@angular/core/testing';
import { of, from } from 'rxjs';
import { FetchBasicDataService } from './fetch-basic-data.service';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { MatchdataAccessService } from '../Dataaccess/matchdata-access.service';
import { Team } from '../Businessrules/basic_datastructures';

describe('FetchBasicDataService', () => {
  let service: FetchBasicDataService;
  let appDataSpy: jasmine.SpyObj<AppdataAccessService>;
  let matchDataSpy: jasmine.SpyObj<MatchdataAccessService>;

  beforeEach(() => {
    appDataSpy = jasmine.createSpyObj(["getTeamByTeamId$"]);
    matchDataSpy = jasmine.createSpyObj(["getActiveTeams$"]);

    TestBed.configureTestingModule({
      providers: [
        FetchBasicDataService,
        { provide: AppdataAccessService, useValue: appDataSpy },
        { provide: MatchdataAccessService, useValue: matchDataSpy }
      ]
    });
    service = TestBed.inject(FetchBasicDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // fetchFrameDataByMatchday$
  // ---------------------------------------------------------------------------

  it('fetchActiveTeams$, teams available', (done: DoneFn) => {
    const argument: number = 2020;

    const teamIds: number[] = [56, 70, 7];
    const teams: Team[] = [
      {
        documentId: "doc_0",
        id: teamIds[0],
        nameLong: "team_name_0",
        nameShort: "T_0"
      },
      {
        documentId: "doc_1",
        id: teamIds[1],
        nameLong: "team_name_1",
        nameShort: "T_1"
      },
      {
        documentId: "doc_2",
        id: teamIds[2],
        nameLong: "team_name_2",
        nameShort: "T_2"
      }
    ];

    matchDataSpy.getActiveTeams$.and.returnValue(from(teamIds));
    appDataSpy.getTeamByTeamId$
      .withArgs(teamIds[0]).and.returnValue(of(teams[0]))
      .withArgs(teamIds[1]).and.returnValue(of(teams[1]))
      .withArgs(teamIds[2]).and.returnValue(of(teams[2]));

    const expectedValues = teams;

    let i: number = 0;
    service["fetchActiveTeams$"](argument).subscribe(
      val => {
        expect(val).toEqual(expectedValues[i++]);
        done();
      }
    );
  });
});
