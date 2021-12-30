import { TestBed } from '@angular/core/testing';
import { UserInteractionVoteBasedService } from './user-interaction-vote-based.service';
import { TopMatchVote } from './basic_datastructures';

describe('UserInteractionVoteBasedService', () => {
  let service: UserInteractionVoteBasedService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserInteractionVoteBasedService]
    });
    service = TestBed.inject(UserInteractionVoteBasedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // sortVotes
  // ---------------------------------------------------------------------------

  it("sortVotes, nVotes evaluated - should be < 0", () => {

    const argument1: any = { nVotes: 5, lastVoteTime: 9000 };
    const argument2: any = { nVotes: 6, lastVoteTime: 9000 };

    expect(service["sortVotes"](argument1, argument2)).toBeLessThan(0);
  });

  it("sortVotes, nVotes evaluated - should be > 0", () => {

    const argument1: any = { nVotes: 5, lastVoteTime: 9000 };
    const argument2: any = { nVotes: 3, lastVoteTime: 9000 };

    expect(service["sortVotes"](argument1, argument2)).toBeGreaterThan(0);
  });

  it("sortVotes, lastVoteTime evaluated - should be > 0", () => {

    const argument1: any = { nVotes: 5, lastVoteTime: 8000 };
    const argument2: any = { nVotes: 5, lastVoteTime: 7000 };

    expect(service["sortVotes"](argument1, argument2)).toBeGreaterThan(0);
  });

  it("sortVotes, lastVoteTime evaluated - should be < 0", () => {

    const argument1: any = { nVotes: 5, lastVoteTime: 6500 };
    const argument2: any = { nVotes: 5, lastVoteTime: 7000 };

    expect(service["sortVotes"](argument1, argument2)).toBeLessThan(0);
  });

  it("sortVotes, random call - should be 0.5", () => {

    const argument1: any = { nVotes: 5, lastVoteTime: 7000 };
    const argument2: any = { nVotes: 5, lastVoteTime: 7000 };
    spyOn<any>(service, "getRandomInt").and.returnValue(1);

    expect(service["sortVotes"](argument1, argument2)).toEqual(0.5);
  });

  // ---------------------------------------------------------------------------
  // evaluateTopMatchVotes
  // ---------------------------------------------------------------------------

  it("evaluateTopMatchVotes, one match has more votes compared to others", () => {

    const argument1: TopMatchVote[] = [
      {
        documentId: "test_doc_0",
        season: 2021,
        matchday: 17,
        matchId: 65001,
        userId: "test_user_0",
        timestamp: 5000
      },
      {
        documentId: "test_doc_1",
        season: 2021,
        matchday: 17,
        matchId: 65000,
        userId: "test_user_1",
        timestamp: 9000
      },
      {
        documentId: "test_doc_2",
        season: 2021,
        matchday: 17,
        matchId: 65000,
        userId: "test_user_2",
        timestamp: 9500
      },
      {
        documentId: "test_doc_3",
        season: 2021,
        matchday: 17,
        matchId: 65002,
        userId: "test_user_3",
        timestamp: 9999
      }
    ];
    const argument2: number[] = [65000, 65001, 65002, 65003];

    expect(service["evaluateTopMatchVotes"](argument1, argument2)).toEqual(65000);
  });

  it("evaluateTopMatchVotes, two matches with same amount of votes", () => {

    const argument1: TopMatchVote[] = [
      {
        documentId: "test_doc_0",
        season: 2021,
        matchday: 17,
        matchId: 65001,
        userId: "test_user_0",
        timestamp: 5000
      },
      {
        documentId: "test_doc_1",
        season: 2021,
        matchday: 17,
        matchId: 65000,
        userId: "test_user_1",
        timestamp: 9000
      },
      {
        documentId: "test_doc_2",
        season: 2021,
        matchday: 17,
        matchId: 65000,
        userId: "test_user_2",
        timestamp: 9500
      },
      {
        documentId: "test_doc_3",
        season: 2021,
        matchday: 17,
        matchId: 65001,
        userId: "test_user_3",
        timestamp: 9999
      }
    ];
    const argument2: number[] = [65000, 65001, 65002];

    expect(service["evaluateTopMatchVotes"](argument1, argument2)).toEqual(65001);
  });

  it("evaluateTopMatchVotes, two matches absolutely identical, expect usage of random decision between two matches", () => {

    const argument1: TopMatchVote[] = [
      {
        documentId: "test_doc_0",
        season: 2021,
        matchday: 17,
        matchId: 65001,
        userId: "test_user_0",
        timestamp: 5000
      },
      {
        documentId: "test_doc_1",
        season: 2021,
        matchday: 17,
        matchId: 65000,
        userId: "test_user_1",
        timestamp: 5000
      },
      {
        documentId: "test_doc_2",
        season: 2021,
        matchday: 17,
        matchId: 65000,
        userId: "test_user_2",
        timestamp: 9500
      },
      {
        documentId: "test_doc_3",
        season: 2021,
        matchday: 17,
        matchId: 65001,
        userId: "test_user_3",
        timestamp: 9999
      },
      {
        documentId: "test_doc_4",
        season: 2021,
        matchday: 17,
        matchId: 65002,
        userId: "test_user_4",
        timestamp: 4000
      },
    ];
    const argument2: number[] = [65000, 65001, 65002, 65003];
    spyOn<any>(service, "getRandomInt").and.returnValue(1);

    expect(service["evaluateTopMatchVotes"](argument1, argument2)).toEqual(65001);
  });

  it("evaluateTopMatchVotes, no votes available, expect usage of random decision between all matches", () => {

    const argument1: TopMatchVote[] = [];
    const argument2: number[] = [65000, 65001, 65002, 65003];
    spyOn<any>(service, "getRandomInt").and.returnValue(2);

    expect(service["evaluateTopMatchVotes"](argument1, argument2)).toEqual(65002);
  });
});
